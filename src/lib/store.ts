import { Store, useStore } from '@tanstack/react-store'
import { currentMonthRange } from '#/lib/format'

export type ThemeMode = 'light' | 'dark' | 'auto'

interface UiState {
  dateFrom: string
  dateTo: string
  theme: ThemeMode
}

const initialRange = currentMonthRange()

/**
 * Global UI state shared across the app (TanStack Store):
 * - the date range used by the Transactions and Transfers filters
 * - the active theme mode (persisted to localStorage)
 */
export const uiStore = new Store<UiState>({
  dateFrom: initialRange.dateFrom,
  dateTo: initialRange.dateTo,
  theme: 'auto',
})

export function setDateRange(dateFrom: string, dateTo: string) {
  uiStore.setState((state) => ({ ...state, dateFrom, dateTo }))
}

export function resetDateRange() {
  const range = currentMonthRange()
  setDateRange(range.dateFrom, range.dateTo)
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'auto') return mode
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(mode)
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
  try {
    window.localStorage.setItem('theme', mode)
  } catch {
    /* ignore storage errors */
  }
}

export function setTheme(mode: ThemeMode) {
  uiStore.setState((state) => ({ ...state, theme: mode }))
  applyTheme(mode)
}

export function initThemeFromStorage() {
  if (typeof window === 'undefined') return
  let stored: ThemeMode = 'auto'
  try {
    const raw = window.localStorage.getItem('theme')
    if (raw === 'light' || raw === 'dark' || raw === 'auto') stored = raw
  } catch {
    /* ignore */
  }
  uiStore.setState((state) => ({ ...state, theme: stored }))
  applyTheme(stored)
}

export function useDateRange() {
  return useStore(uiStore, (state) => ({
    dateFrom: state.dateFrom,
    dateTo: state.dateTo,
  }))
}

export function useTheme() {
  return useStore(uiStore, (state) => state.theme)
}
