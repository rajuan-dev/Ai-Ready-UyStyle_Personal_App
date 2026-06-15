const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'db-debug.json'), 'utf8'));
const mockItems = data.items;
const mockPrefs = data.stylePrefs;

function colorMatches(itemColor, prefColors) {
    if (!prefColors?.length) return true;
    if (prefColors.some(p => {
        const pref = p.trim().toLowerCase();
        return pref === 'any_color' || pref === 'any color';
    })) {
        return true;
    }
    if (!itemColor || !itemColor.trim()) return false;
    const c = itemColor.trim().toLowerCase();
    return prefColors.some(p => {
        const pref = p.trim().toLowerCase();
        if (!pref) return false;
        return c.includes(pref) || pref.includes(c);
    });
}

function shuffleArr(arr) {
    const next = [...arr];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
}

function filterByKeywords(items, keywords) {
    if (!keywords.length) return items;
    return items.filter(i =>
        keywords.some(
            k =>
                (i.category ?? '').toLowerCase().includes(k) ||
                (i.title ?? '').toLowerCase().includes(k),
        ),
    );
}

const getOutfitSignature = (items) => {
    return items.map(item => item.id).sort().join(',');
};

const getCoreSignature = (items) => {
    const primaryCategoriesRegex = /top|shirt|sweater|blouse|tee|knit|bottom|jean|trouser|pant|skirt|short/i;
    return items
        .filter(item => primaryCategoriesRegex.test(item.category))
        .map(item => item.id)
        .sort()
        .join(',');
};

const MAX_COMBO_ENUMERATION = 20000;

const getRandomItem = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

function categorise(pool) {
    return {
        tops:        pool.filter(i => /top|shirt|sweater|blouse|tee|knit|polo|tank|sleeveless|layer/i.test(i.category)),
        bottoms:     pool.filter(i => /bottom|pant|jean|skirt|short|trouser|legging|chino/i.test(i.category)),
        shoes:       pool.filter(i => /shoe|sneaker|boot|sandal|footwear|loafer|heel|oxford|ankle/i.test(i.category)),
        outerwear:   pool.filter(i => /outer|coat|jacket|blazer|trench|vest/i.test(i.category)),
        accessories: pool.filter(i => !/top|shirt|sweater|blouse|tee|knit|polo|tank|sleeveless|bottom|pant|jean|skirt|short|trouser|legging|chino|shoe|sneaker|boot|sandal|footwear|loafer|heel|oxford|ankle|outer|coat|jacket|blazer|trench|vest/i.test(i.category)),
    };
}

const FILTER_KEYWORDS = {
    all:     [],
    gym:     ['gym', 'sport', 'active', 'athletic', 'workout', 'legging', 'shorts'],
    formal:  ['formal', 'business', 'office', 'suit', 'blazer', 'chino', 'oxford'],
    night:   ['night', 'party', 'evening', 'dress', 'heels', 'velvet'],
    weekend: ['casual', 'weekend', 'relax', 'denim', 'hoodie', 'sneaker'],
    casual:  ['casual', 'basic', 't-shirt', 'jeans', 'tee', 'linen'],
};

const FILTER_TABS = [
    { id: 'all',     label: 'All'       },
    { id: 'casual',  label: 'Casual'    },
    { id: 'gym',     label: 'Gym'       },
    { id: 'formal',  label: 'Formal'    },
    { id: 'night',   label: 'Night Out' },
    { id: 'weekend', label: 'Weekend'   },
];

const OUTFIT_NAMES = {
    all:     ['Everyday Look', 'Daily Fit', 'Go-To Outfit', 'Fresh Combo', 'Signature Set'],
    casual:  ['Chill Vibes', 'Weekend Casual', 'Laid-Back Look', 'Easy Day'],
    gym:     ['Gym Session', 'Workout Ready', 'Active Mode', 'Power Set'],
    formal:  ['Office Ready', 'Business Look', 'Smart Formal', 'Sharp Edge'],
    night:   ['Night Out', 'Evening Glam', 'Party Mode', 'Golden Hour'],
    weekend: ['Brunch Ready', 'Sunday Fit', 'Weekend Mood', 'Brunch Ready', 'City Wander'],
};

function generateOutfits(
    items,
    filter,
    stylePrefs,
    weather,
    shownSignatures,
    shownCoreSignatures,
    shownItemCounts,
    count = 3
) {
    let pool = items;
    const occKw = FILTER_KEYWORDS[filter];
    if (occKw.length) {
        const filtered = filterByKeywords(items, occKw);
        pool = filtered.length >= 2 ? filtered : items;
    }

    if (stylePrefs?.colors?.length) {
        const colorFiltered = pool.filter(i =>
            colorMatches(i.color, stylePrefs.colors),
        );
        pool = colorFiltered.length >= 2 ? colorFiltered : pool;
    }

    if (pool.length === 0) return { outfits: [], notEnough: true };

    const { tops, bottoms, shoes, outerwear, accessories } = categorise(pool);

    const shuffledTops = shuffleArr(tops);
    const shuffledBottoms = shuffleArr(bottoms);
    const shuffledShoes = shuffleArr(shoes);
    const shuffledOuterwear = shuffleArr(outerwear);
    const shuffledAccessories = shuffleArr(accessories);

    const topOptions = shuffledTops.length > 0 ? shuffledTops : [null];
    const bottomOptions = shuffledBottoms.length > 0 ? shuffledBottoms : [null];
    const shoeOptions = shuffledShoes.length > 0 ? shuffledShoes : [null];
    const outerOptions = shuffledOuterwear.length > 0 ? [null, ...shuffledOuterwear] : [null];
    const accessoryOptions = shuffledAccessories.length > 0 ? [null, ...shuffledAccessories] : [null];
    const totalPossible =
        topOptions.length *
        bottomOptions.length *
        shoeOptions.length *
        outerOptions.length *
        accessoryOptions.length;

    const candidates = [];
    const seenKeys = new Set();
    const addCandidate = (combo) => {
        if (combo.length === 0) return;
        const sig = getOutfitSignature(combo);
        if (seenKeys.has(sig)) return;
        seenKeys.add(sig);
        candidates.push(combo);
    };

    if (totalPossible <= MAX_COMBO_ENUMERATION) {
        for (const t of topOptions) {
            for (const b of bottomOptions) {
                for (const s of shoeOptions) {
                    for (const o of outerOptions) {
                        for (const a of accessoryOptions) {
                            addCandidate([t, b, s, o, a].filter(Boolean));
                        }
                    }
                }
            }
        }
    } else {
        const targetPoolSize = Math.max(count * 24, 240);
        const maxAttempts = Math.max(targetPoolSize * 20, 5000);

        for (let attempt = 0; attempt < maxAttempts && candidates.length < targetPoolSize; attempt += 1) {
            addCandidate(
                [
                    getRandomItem(topOptions),
                    getRandomItem(bottomOptions),
                    getRandomItem(shoeOptions),
                    getRandomItem(outerOptions),
                    getRandomItem(accessoryOptions),
                ].filter(Boolean),
            );
        }
    }

    const outfits = [];
    const names = OUTFIT_NAMES[filter];
    const occasion = FILTER_TABS.find(t => t.id === filter)?.label ?? 'Everyday';
    const unseenCandidates = shuffleArr(
        candidates.filter(C => !shownSignatures.has(getOutfitSignature(C))),
    );
    const fallbackCandidates = shuffleArr(
        candidates.filter(C => shownSignatures.has(getOutfitSignature(C))),
    );

    for (let oIdx = 0; oIdx < count; oIdx++) {
        const unseenPoolCandidates = unseenCandidates.filter(C => {
            const sig = getOutfitSignature(C);
            return !outfits.some(o => getOutfitSignature(o.items) === sig);
        });
        const fallbackPoolCandidates = fallbackCandidates.filter(C => {
            const sig = getOutfitSignature(C);
            return !outfits.some(o => getOutfitSignature(o.items) === sig);
        });
        const poolCandidates = unseenPoolCandidates.length > 0
            ? unseenPoolCandidates
            : fallbackPoolCandidates;

        if (poolCandidates.length === 0) break;

        const scored = poolCandidates.map(C => {
            const coreSig = getCoreSignature(C);
            let score = 0;
            if (shownCoreSignatures.has(coreSig)) {
                score += 1000;
            }
            if (outfits.some(o => getCoreSignature(o.items) === coreSig)) {
                score += 500;
            }
            
            for (const item of C) {
                const count = shownItemCounts[item.id] || 0;
                const isPrimary = /top|shirt|sweater|blouse|tee|knit|bottom|jean|trouser|pant|skirt|short/i.test(item.category);
                score += count * (isPrimary ? 50 : 10);
            }

            for (const item of C) {
                if (outfits.some(o => o.items.some(oi => oi.id === item.id))) {
                    const isPrimary = /top|shirt|sweater|blouse|tee|knit|bottom|jean|trouser|pant|skirt|short/i.test(item.category);
                    score += isPrimary ? 30 : 10;
                }
            }

            return { combo: C, score };
        });

        scored.sort((a, b) => a.score - b.score);

        const bestScore = scored[0]?.score ?? 0;
        const bestOptions = scored.filter(s => s.score === bestScore);
        const selectedCombo = bestOptions[Math.floor(Math.random() * bestOptions.length)]?.combo;

        if (!selectedCombo) break;

        const fullSig = getOutfitSignature(selectedCombo);
        const coreSig = getCoreSignature(selectedCombo);
        shownSignatures.add(fullSig);
        shownCoreSignatures.add(coreSig);
        for (const item of selectedCombo) {
            shownItemCounts[item.id] = (shownItemCounts[item.id] || 0) + 1;
        }

        outfits.push({
            id:      `outfit-${Date.now()}-${oIdx}`,
            name:    names[oIdx % names.length],
            occasion,
            weather: weather ?? null,
            items:   selectedCombo,
        });
    }

    return { outfits, notEnough: outfits.length === 0 };
}

const shownSignatures = new Set();
const shownCoreSignatures = new Set();
const shownItemCounts = {};

console.log("Starting simulation with device data and new 5-category logic...");
for (let i = 1; i <= 5; i++) {
    console.log(`\n=== GENERATION RUN #${i} ===`);
    const { outfits } = generateOutfits(
        mockItems,
        'all',
        mockPrefs,
        null,
        shownSignatures,
        shownCoreSignatures,
        shownItemCounts
    );
    outfits.forEach(o => {
        console.log(`- ${o.name}:`);
        o.items.forEach(item => {
            console.log(`  * [${item.category}] ${item.title} (${item.color})`);
        });
    });
}
