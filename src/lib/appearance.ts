export type AccentPaletteId = 'violet' | 'ocean' | 'rose' | 'mint' | 'amber';

export interface AppearanceSettings {
  accentPalette: AccentPaletteId;
  glassOpacity: number;
  glassBlur: number;
  reflectionStrength: number;
  ambientGlowEnabled: boolean;
  ambientGlowIntensity: number;
}

export const ACCENT_PALETTES: { id: AccentPaletteId; name: string; color: string; hover: string }[] = [
  { id: 'violet', name: 'Violeta', color: '#7C5CFF', hover: '#6D48F7' },
  { id: 'ocean', name: 'Océano', color: '#0284C7', hover: '#0369A1' },
  { id: 'rose', name: 'Rosa', color: '#E11D48', hover: '#BE123C' },
  { id: 'mint', name: 'Menta', color: '#0F9F8F', hover: '#0F766E' },
  { id: 'amber', name: 'Ámbar', color: '#D97706', hover: '#B45309' },
];

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  accentPalette: 'violet',
  glassOpacity: 60,
  glassBlur: 30,
  reflectionStrength: 75,
  ambientGlowEnabled: true,
  ambientGlowIntensity: 70,
};

const isAccentPalette = (value: unknown): value is AccentPaletteId =>
  typeof value === 'string' && ACCENT_PALETTES.some((palette) => palette.id === value);

export function loadAppearanceSettings(): AppearanceSettings {
  try {
    const raw = localStorage.getItem('beatnest_appearance');
    if (!raw) return { ...DEFAULT_APPEARANCE };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_APPEARANCE };
    const saved = parsed as Partial<AppearanceSettings>;
    return {
      accentPalette: isAccentPalette(saved.accentPalette) ? saved.accentPalette : DEFAULT_APPEARANCE.accentPalette,
      glassOpacity: typeof saved.glassOpacity === 'number' && Number.isFinite(saved.glassOpacity)
        ? Math.max(20, Math.min(90, saved.glassOpacity))
        : DEFAULT_APPEARANCE.glassOpacity,
      glassBlur: typeof saved.glassBlur === 'number' && Number.isFinite(saved.glassBlur)
        ? Math.max(0, Math.min(40, saved.glassBlur))
        : DEFAULT_APPEARANCE.glassBlur,
      reflectionStrength: typeof saved.reflectionStrength === 'number' && Number.isFinite(saved.reflectionStrength)
        ? Math.max(0, Math.min(100, saved.reflectionStrength))
        : DEFAULT_APPEARANCE.reflectionStrength,
      ambientGlowEnabled: typeof saved.ambientGlowEnabled === 'boolean'
        ? saved.ambientGlowEnabled
        : DEFAULT_APPEARANCE.ambientGlowEnabled,
      ambientGlowIntensity: typeof saved.ambientGlowIntensity === 'number' && Number.isFinite(saved.ambientGlowIntensity)
        ? Math.max(0, Math.min(100, saved.ambientGlowIntensity))
        : DEFAULT_APPEARANCE.ambientGlowIntensity,
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

function rgbaFromHex(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function applyAppearanceSettings(settings: AppearanceSettings, theme: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const palette = ACCENT_PALETTES.find((item) => item.id === settings.accentPalette) ?? ACCENT_PALETTES[0];
  const dark = theme === 'dark';
  const reflection = settings.reflectionStrength / 100;
  const glassAlpha = settings.glassOpacity / 100;

  root.style.setProperty('--app-primary', palette.color);
  root.style.setProperty('--app-primary-hover', palette.hover);
  root.style.setProperty('--app-primary-light', rgbaFromHex(palette.color, dark ? 0.18 : 0.12));
  root.style.setProperty('--app-accent', dark ? palette.color : palette.hover);
  root.style.setProperty('--liquid-glass-bg', `${dark ? 'rgba(17, 19, 32' : 'rgba(246, 249, 255'}, ${glassAlpha})`);
  root.style.setProperty('--liquid-glass-dock', `${dark ? 'rgba(17, 19, 32' : 'rgba(249, 251, 255'}, ${Math.min(0.96, glassAlpha + 0.14)})`);
  root.style.setProperty('--liquid-glass-highlight', `rgba(255, 255, 255, ${dark ? 0.04 + reflection * 0.18 : 0.2 + reflection * 0.62})`);
  root.style.setProperty('--liquid-glass-highlight-low', `rgba(255, 255, 255, ${0.02 + reflection * 0.12})`);
  root.style.setProperty('--liquid-glass-border', `rgba(255, 255, 255, ${dark ? 0.08 + reflection * 0.12 : 0.3 + reflection * 0.52})`);
  root.style.setProperty('--liquid-glass-blur-sm', `${settings.glassBlur * 0.65}px`);
  root.style.setProperty('--liquid-glass-blur-md', `${settings.glassBlur}px`);
  root.style.setProperty('--liquid-glass-blur-lg', `${settings.glassBlur * 1.15}px`);
  root.style.setProperty('--liquid-glass-blur-xl', `${settings.glassBlur * 1.3}px`);
  root.style.setProperty('--ambient-glow-opacity', settings.ambientGlowEnabled ? String(settings.ambientGlowIntensity / 100) : '0');
}
