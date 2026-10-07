import { create } from 'zustand';

export type LibraryDensity = 'comfortable' | 'compact';
export type LibraryGridColumns = 2 | 3 | 4 | 5 | 6;

interface LibraryDisplayPreferences {
  density: LibraryDensity;
  gridColumns: LibraryGridColumns;
  setDensity: (density: LibraryDensity) => void;
  setGridColumns: (columns: LibraryGridColumns) => void;
}

function loadPreferences(): Pick<LibraryDisplayPreferences, 'density' | 'gridColumns'> {
  const defaults = { density: 'comfortable' as LibraryDensity, gridColumns: 4 as LibraryGridColumns };
  try {
    const raw = localStorage.getItem('beatnest_library_display');
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaults;
    const saved = parsed as { density?: unknown; gridColumns?: unknown };
    const validColumns: LibraryGridColumns[] = [2, 3, 4, 5, 6];
    return {
      density: saved.density === 'compact' ? 'compact' : 'comfortable',
      gridColumns: validColumns.includes(saved.gridColumns as LibraryGridColumns)
        ? saved.gridColumns as LibraryGridColumns
        : defaults.gridColumns,
    };
  } catch {
    return defaults;
  }
}

function persist(density: LibraryDensity, gridColumns: LibraryGridColumns) {
  try {
    localStorage.setItem('beatnest_library_display', JSON.stringify({ density, gridColumns }));
  } catch (error) {
    console.warn('Could not save library display preferences:', error);
  }
}

export const useLibraryDisplayPreferencesStore = create<LibraryDisplayPreferences>((set, get) => ({
  ...loadPreferences(),

  setDensity: (density) => {
    persist(density, get().gridColumns);
    set({ density });
  },

  setGridColumns: (gridColumns) => {
    persist(get().density, gridColumns);
    set({ gridColumns });
  },
}));
