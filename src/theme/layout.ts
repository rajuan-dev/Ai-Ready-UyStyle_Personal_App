export const FLOATING_TAB_BAR_HEIGHT = 70;
export const FLOATING_TAB_BAR_MIN_BOTTOM_GAP = 16;
export const FLOATING_SCREEN_BOTTOM_EXTRA = 32;

export const getFloatingTabBarMetrics = (bottomInset: number) => {
  const safeBottom = Math.max(bottomInset, FLOATING_TAB_BAR_MIN_BOTTOM_GAP);

  return {
    safeBottom,
    height: FLOATING_TAB_BAR_HEIGHT,
    paddingBottom: 10,
  };
};

export const getTabScreenBottomPadding = (bottomInset: number, extra = FLOATING_SCREEN_BOTTOM_EXTRA) => {
  const { safeBottom, height } = getFloatingTabBarMetrics(bottomInset);
  return height + safeBottom + extra;
};
