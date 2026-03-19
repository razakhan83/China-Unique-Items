/**
 * Category Color System
 * Maps category names to consistent pastel color palettes.
 * All colors use similar saturation/lightness for visual harmony.
 */

const CATEGORY_COLOR_MAP = {
  'kitchen accessories': {
    bg: 'bg-green-50',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800 border-green-200',
    border: 'border-green-100',
    accent: '#166534',
    hex: '#f0fdf4',
  },
  'home decor': {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    border: 'border-orange-100',
    accent: '#9a3412',
    hex: '#fff7ed',
  },
  'health & beauty': {
    bg: 'bg-pink-50',
    text: 'text-pink-800',
    badge: 'bg-pink-100 text-pink-800 border-pink-200',
    border: 'border-pink-100',
    accent: '#9d174d',
    hex: '#fdf2f8',
  },
  'stationery': {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    border: 'border-blue-100',
    accent: '#1e40af',
    hex: '#eff6ff',
  },
  'toys & games': {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    border: 'border-purple-100',
    accent: '#6b21a8',
    hex: '#faf5ff',
  },
  'electronics': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    border: 'border-cyan-100',
    accent: '#155e75',
    hex: '#ecfeff',
  },
  'fashion': {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    border: 'border-rose-100',
    accent: '#9f1239',
    hex: '#fff1f2',
  },
  'sports & fitness': {
    bg: 'bg-lime-50',
    text: 'text-lime-800',
    badge: 'bg-lime-100 text-lime-800 border-lime-200',
    border: 'border-lime-100',
    accent: '#3f6212',
    hex: '#f7fee7',
  },
  'pet supplies': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    border: 'border-amber-100',
    accent: '#92400e',
    hex: '#fffbeb',
  },
  'automotive': {
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    border: 'border-slate-100',
    accent: '#1e293b',
    hex: '#f8fafc',
  },
};

// Fallback palette for categories not explicitly mapped
const FALLBACK_PALETTES = [
  { bg: 'bg-teal-50', text: 'text-teal-800', badge: 'bg-teal-100 text-teal-800 border-teal-200', border: 'border-teal-100', accent: '#115e59', hex: '#f0fdfa' },
  { bg: 'bg-indigo-50', text: 'text-indigo-800', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', border: 'border-indigo-100', accent: '#3730a3', hex: '#eef2ff' },
  { bg: 'bg-emerald-50', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', border: 'border-emerald-100', accent: '#065f46', hex: '#ecfdf5' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-800', badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', border: 'border-fuchsia-100', accent: '#86198f', hex: '#fdf4ff' },
  { bg: 'bg-sky-50', text: 'text-sky-800', badge: 'bg-sky-100 text-sky-800 border-sky-200', border: 'border-sky-100', accent: '#075985', hex: '#f0f9ff' },
  { bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', border: 'border-yellow-100', accent: '#854d0e', hex: '#fefce8' },
];

// Simple hash to get consistent color for unknown categories
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get color palette for a category name.
 * @param {string} categoryName - The display name of the category
 * @returns {{ bg: string, text: string, badge: string, border: string, accent: string, hex: string }}
 */
export function getCategoryColor(categoryName) {
  if (!categoryName) return FALLBACK_PALETTES[0];

  const key = categoryName.toLowerCase().trim();
  if (CATEGORY_COLOR_MAP[key]) return CATEGORY_COLOR_MAP[key];

  // Consistent fallback based on name hash
  const idx = hashString(key) % FALLBACK_PALETTES.length;
  return FALLBACK_PALETTES[idx];
}

/**
 * Get all known category colors (for reference/debugging)
 */
export function getAllCategoryColors() {
  return { ...CATEGORY_COLOR_MAP };
}
