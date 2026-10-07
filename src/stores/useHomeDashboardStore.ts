import { create } from 'zustand';

export type HomeSectionId = 'recent' | 'added' | 'played' | 'playlists';
export type LandingView = 'last' | 'home' | 'tracks' | 'favorites';

export const HOME_SECTION_ORDER: HomeSectionId[] = ['recent', 'added', 'played', 'playlists'];
export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  recent: 'Escuchado recientemente',
  added: 'Añadido recientemente',
  played: 'Más reproducido',
  playlists: 'Tus playlists',
};

interface HomeDashboardPreferences {
  sectionOrder: HomeSectionId[];
  visibleSections: Record<HomeSectionId, boolean>;
  maxItems: 3 | 6 | 9;
  landingView: LandingView;
  toggleSection: (section: HomeSectionId) => void;
  moveSection: (section: HomeSectionId, direction: -1 | 1) => void;
  setMaxItems: (count: 3 | 6 | 9) => void;
  setLandingView: (view: LandingView) => void;
}

const DEFAULT_VISIBLE: Record<HomeSectionId, boolean> = {
  recent: true,
  added: true,
  played: true,
  playlists: true,
};

function loadPreferences(): Pick<HomeDashboardPreferences, 'sectionOrder' | 'visibleSections' | 'maxItems' | 'landingView'> {
  const defaults = {
    sectionOrder: [...HOME_SECTION_ORDER],
    visibleSections: { ...DEFAULT_VISIBLE },
    maxItems: 6 as const,
    landingView: 'last' as LandingView,
  };
  try {
    const raw = localStorage.getItem('beatnest_home_dashboard');
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaults;
    const saved = parsed as {
      sectionOrder?: unknown;
      visibleSections?: Partial<Record<HomeSectionId, unknown>>;
      maxItems?: unknown;
      landingView?: unknown;
    };
    const incomingOrder = Array.isArray(saved.sectionOrder)
      ? saved.sectionOrder.filter((id): id is HomeSectionId => HOME_SECTION_ORDER.includes(id as HomeSectionId))
      : [];
    const sectionOrder = [...new Set(incomingOrder)];
    HOME_SECTION_ORDER.forEach((id) => {
      if (!sectionOrder.includes(id)) sectionOrder.push(id);
    });
    const visibleSections = { ...DEFAULT_VISIBLE };
    HOME_SECTION_ORDER.forEach((id) => {
      const visible = saved.visibleSections?.[id];
      if (typeof visible === 'boolean') visibleSections[id] = visible;
    });
    const validLandingViews: LandingView[] = ['last', 'home', 'tracks', 'favorites'];
    return {
      sectionOrder,
      visibleSections,
      maxItems: saved.maxItems === 3 || saved.maxItems === 9 ? saved.maxItems : 6,
      landingView: validLandingViews.includes(saved.landingView as LandingView)
        ? saved.landingView as LandingView
        : 'last',
    };
  } catch {
    return defaults;
  }
}

function persist(
  sectionOrder: HomeSectionId[],
  visibleSections: Record<HomeSectionId, boolean>,
  maxItems: 3 | 6 | 9,
  landingView: LandingView,
) {
  try {
    localStorage.setItem('beatnest_home_dashboard', JSON.stringify({ sectionOrder, visibleSections, maxItems, landingView }));
  } catch (error) {
    console.warn('Could not save home dashboard preferences:', error);
  }
}

export const useHomeDashboardStore = create<HomeDashboardPreferences>((set, get) => ({
  ...loadPreferences(),

  toggleSection: (section) => {
    const visibleSections = { ...get().visibleSections, [section]: !get().visibleSections[section] };
    persist(get().sectionOrder, visibleSections, get().maxItems, get().landingView);
    set({ visibleSections });
  },

  moveSection: (section, direction) => {
    const sectionOrder = [...get().sectionOrder];
    const index = sectionOrder.indexOf(section);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) return;
    [sectionOrder[index], sectionOrder[nextIndex]] = [sectionOrder[nextIndex], sectionOrder[index]];
    persist(sectionOrder, get().visibleSections, get().maxItems, get().landingView);
    set({ sectionOrder });
  },

  setMaxItems: (maxItems) => {
    persist(get().sectionOrder, get().visibleSections, maxItems, get().landingView);
    set({ maxItems });
  },

  setLandingView: (landingView) => {
    persist(get().sectionOrder, get().visibleSections, get().maxItems, landingView);
    set({ landingView });
  },
}));
