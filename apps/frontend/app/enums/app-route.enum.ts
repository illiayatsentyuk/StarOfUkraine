/** Central place for app path constants (must match Nuxt `pages/` routes). */
export enum AppRoute {
  Home = '/',
  Auth = '/auth',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password',
}

/** Paths where tournament header search is hidden (no list UX / avoid stray API calls). */
export const ROUTES_WITHOUT_TOURNAMENT_SEARCH: readonly AppRoute[] = [
  AppRoute.Auth,
  AppRoute.ForgotPassword,
  AppRoute.ResetPassword,
]

export function isRouteWithoutTournamentSearch(path: string): boolean {
  return (ROUTES_WITHOUT_TOURNAMENT_SEARCH as readonly string[]).includes(path)
}
