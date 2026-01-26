// utils/navigationUtils.ts
export const SCREENS_WITH_BOTTOM_NAV = [
  'home',
  'map', 
  'rides',
  'profile'
];

export const SCREENS_WITHOUT_BOTTOM_NAV = [
  'bike-details',
  'scan', 
  'wallet', 
  'ride-details', 
  'edit-profile', 
  'security', 
  'notifications', 
  'chat', 
  'report-issue', 
  'bike-inspection',
  'ride-in-progress'
];

export function shouldShowBottomNav(currentScreen: string): boolean {
  return SCREENS_WITH_BOTTOM_NAV.includes(currentScreen);
}