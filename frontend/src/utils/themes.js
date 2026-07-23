/**
 * TalentIQ — UI Theme Engine
 * 
 * Each theme overrides the CSS custom properties on :root via JS.
 * The active theme ID is persisted to localStorage.
 */

export const UI_THEMES = {
  // ── 1. Deep Space (default) ─────────────────────────────────────────────────
  'deep-space': {
    id: 'deep-space',
    name: 'Deep Space',
    emoji: '🌌',
    description: 'The original dark cosmos — deep navy with violet accents.',
    preview: ['#07070e', '#7b6fff', '#00cfa8'],
    vars: {
      '--bg':           '#07070e',
      '--s1':           '#0e0e1c',
      '--s2':           '#15152a',
      '--s3':           '#1c1c32',
      '--border':       'rgba(255,255,255,0.06)',
      '--border-focus': 'rgba(123,111,255,0.4)',
      '--b2':           'rgba(255,255,255,0.11)',
      '--text':         '#eaeaf5',
      '--muted':        '#8888a5',
      '--v':            '#7b6fff',
      '--v-glow':       'rgba(123,111,255,0.15)',
      '--t':            '#00cfa8',
      '--t-glow':       'rgba(0,207,168,0.15)',
      '--a':            '#f5a623',
      '--r':            '#ff6b6b',
      '--g':            '#1ecb7b',
      '--b':            '#4f8fff',
      '--pk':           '#e865c8',
    },
  },

  // ── 2. Midnight Blue ────────────────────────────────────────────────────────
  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    emoji: '🌊',
    description: 'Deep ocean blues with electric cyan highlights.',
    preview: ['#050d1a', '#4f8fff', '#00e5ff'],
    vars: {
      '--bg':           '#050d1a',
      '--s1':           '#091525',
      '--s2':           '#0d1f35',
      '--s3':           '#122844',
      '--border':       'rgba(79,143,255,0.1)',
      '--border-focus': 'rgba(79,143,255,0.5)',
      '--b2':           'rgba(79,143,255,0.15)',
      '--text':         '#e0eeff',
      '--muted':        '#6a8caa',
      '--v':            '#4f8fff',
      '--v-glow':       'rgba(79,143,255,0.18)',
      '--t':            '#00e5ff',
      '--t-glow':       'rgba(0,229,255,0.15)',
      '--a':            '#ffa94d',
      '--r':            '#ff6b6b',
      '--g':            '#00e676',
      '--b':            '#64b5f6',
      '--pk':           '#e040fb',
    },
  },

  // ── 3. Emerald Forest ───────────────────────────────────────────────────────
  'emerald-forest': {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    emoji: '🌿',
    description: 'Lush greens and warm amber — clean and professional.',
    preview: ['#041209', '#1ecb7b', '#f5a623'],
    vars: {
      '--bg':           '#041209',
      '--s1':           '#071f10',
      '--s2':           '#0b2c18',
      '--s3':           '#0f3a20',
      '--border':       'rgba(30,203,123,0.1)',
      '--border-focus': 'rgba(30,203,123,0.45)',
      '--b2':           'rgba(30,203,123,0.15)',
      '--text':         '#dff7ec',
      '--muted':        '#6a997e',
      '--v':            '#1ecb7b',
      '--v-glow':       'rgba(30,203,123,0.2)',
      '--t':            '#00cfa8',
      '--t-glow':       'rgba(0,207,168,0.15)',
      '--a':            '#f5a623',
      '--r':            '#ff6b6b',
      '--g':            '#69f0ae',
      '--b':            '#40c4ff',
      '--pk':           '#f06292',
    },
  },

  // ── 4. Solar Flare ──────────────────────────────────────────────────────────
  'solar-flare': {
    id: 'solar-flare',
    name: 'Solar Flare',
    emoji: '☀️',
    description: 'Warm amber and orange tones — energetic and bold.',
    preview: ['#120900', '#f5a623', '#ff6b6b'],
    vars: {
      '--bg':           '#120900',
      '--s1':           '#1c1000',
      '--s2':           '#261800',
      '--s3':           '#312100',
      '--border':       'rgba(245,166,35,0.12)',
      '--border-focus': 'rgba(245,166,35,0.5)',
      '--b2':           'rgba(245,166,35,0.16)',
      '--text':         '#fff5e0',
      '--muted':        '#9a8060',
      '--v':            '#f5a623',
      '--v-glow':       'rgba(245,166,35,0.2)',
      '--t':            '#ff8f00',
      '--t-glow':       'rgba(255,143,0,0.15)',
      '--a':            '#ffd54f',
      '--r':            '#ff6b6b',
      '--g':            '#a5d6a7',
      '--b':            '#4fc3f7',
      '--pk':           '#f48fb1',
    },
  },

  // ── 5. Rose Quartz ─────────────────────────────────────────────────────────
  'rose-quartz': {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    emoji: '🌸',
    description: 'Elegant pink and purple hues — modern and creative.',
    preview: ['#120812', '#e865c8', '#7b6fff'],
    vars: {
      '--bg':           '#120812',
      '--s1':           '#1e0d1e',
      '--s2':           '#2a132a',
      '--s3':           '#361a36',
      '--border':       'rgba(232,101,200,0.1)',
      '--border-focus': 'rgba(232,101,200,0.45)',
      '--b2':           'rgba(232,101,200,0.15)',
      '--text':         '#fbe8f7',
      '--muted':        '#9a6a92',
      '--v':            '#e865c8',
      '--v-glow':       'rgba(232,101,200,0.2)',
      '--t':            '#ce93d8',
      '--t-glow':       'rgba(206,147,216,0.15)',
      '--a':            '#f5a623',
      '--r':            '#ef5350',
      '--g':            '#66bb6a',
      '--b':            '#7b6fff',
      '--pk':           '#f48fb1',
    },
  },

  // ── 6. Arctic Frost ─────────────────────────────────────────────────────────
  'arctic-frost': {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    emoji: '❄️',
    description: 'Cool white-grey with icy blue accents — crisp and minimal.',
    preview: ['#f0f4f8', '#4f8fff', '#00cfa8'],
    vars: {
      '--bg':           '#f0f4f8',
      '--s1':           '#ffffff',
      '--s2':           '#e8edf3',
      '--s3':           '#d8e0ea',
      '--border':       'rgba(0,0,0,0.08)',
      '--border-focus': 'rgba(79,143,255,0.4)',
      '--b2':           'rgba(0,0,0,0.12)',
      '--text':         '#1a2332',
      '--muted':        '#6b7a8d',
      '--v':            '#4f8fff',
      '--v-glow':       'rgba(79,143,255,0.15)',
      '--t':            '#00cfa8',
      '--t-glow':       'rgba(0,207,168,0.15)',
      '--a':            '#f5a623',
      '--r':            '#e53935',
      '--g':            '#1ecb7b',
      '--b':            '#1565c0',
      '--pk':           '#e865c8',
    },
  },
};

export const DEFAULT_THEME_ID = 'deep-space';

/**
 * Apply a theme by writing CSS variables directly to :root.
 * Smoothly transitions via CSS `transition` on all properties.
 */
export function applyTheme(themeId) {
  const theme = UI_THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement;

  // Enable smooth transition (only on first call if not already set)
  if (!root.style.getPropertyValue('transition')) {
    root.style.transition = 'background-color 0.5s ease, color 0.5s ease';
  }

  Object.entries(theme.vars).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });

  // Persist selection
  try { localStorage.setItem('talentiq-ui-theme', themeId); } catch {}

  return theme;
}

/** Get the last saved theme ID (or default) */
export function getSavedThemeId() {
  try {
    const saved = localStorage.getItem('talentiq-ui-theme');
    return (saved && UI_THEMES[saved]) ? saved : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}
