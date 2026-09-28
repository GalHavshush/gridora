import type { StateStorage } from 'zustand/middleware'

/**
 * Where Gridora keeps dashboards. This is the only place that knows about localStorage:
 * to add cloud sync later, provide another (possibly async) StateStorage here.
 */
export const dashboardStorage: StateStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      // Usually the storage quota; keep the app running with the in-memory state.
      console.warn('[Gridora] Could not save your dashboard.', error)
    }
  },
  removeItem: (key) => localStorage.removeItem(key),
}
