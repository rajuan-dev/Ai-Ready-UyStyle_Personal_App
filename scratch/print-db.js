const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBvjn_sPL2WGdv19bGAjE60XYRh5RIuSUQ',
  appId: '1:844436071910:ios:eb0f2d6274d4e1d1b1a227',
  messagingSenderId: '844436071910',
  projectId: 'ustyle-2d7b5',
  storageBucket: 'ustyle-2d7b5.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const itemsSnap = await getDocs(collection(db, 'closetItems'));
  console.log('--- CLOSET ITEMS ---');
  itemsSnap.forEach(doc => {
    const data = doc.data();
    console.log(JSON.stringify({
      id: doc.id,
      title: data.title,
      category: data.category,
      color: data.color,
      userId: data.userId
    }));
  });

  const prefsSnap = await getDocs(collection(db, 'stylePrefs'));
  console.log('--- STYLE PREFS ---');
  prefsSnap.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

run().catch(console.error);
