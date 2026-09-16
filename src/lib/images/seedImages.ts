/** A generated placeholder image, as raw SVG source — not yet stored anywhere. */
export interface SeedImage {
  id: string;
  name: string;
  blob: Blob;
}

/**
 * Default placeholder deck so the game is playable before an admin uploads
 * real images. Themed around memory and Alzheimer's (the puzzle piece is
 * the movement's global awareness symbol; palette leans purple, its
 * awareness color). Generated locally as inline SVG — no external assets,
 * no licensing concerns.
 */
const SEED_ITEMS: { emoji: string; name: string; bg: string }[] = [
  { emoji: '🧠', name: 'Cerebro', bg: '#DDD6FE' },
  { emoji: '🧩', name: 'Rompecabezas', bg: '#C4B5FD' },
  { emoji: '🎗️', name: 'Cinta de conciencia', bg: '#E9D5FF' },
  { emoji: '🔑', name: 'Llaves', bg: '#FDE68A' },
  { emoji: '👓', name: 'Lentes', bg: '#BFDBFE' },
  { emoji: '⏰', name: 'Despertador', bg: '#FDBA74' },
  { emoji: '📔', name: 'Diario', bg: '#FBCFE8' },
  { emoji: '💊', name: 'Medicinas', bg: '#A7F3D0' },
  { emoji: '🖼️', name: 'Retrato familiar', bg: '#FED7AA' },
  { emoji: '🧶', name: 'Estambre enredado', bg: '#FCA5A5' },
  { emoji: '🔍', name: 'Lupa', bg: '#BAE6FD' },
  { emoji: '📅', name: 'Calendario', bg: '#C7D2FE' },
  { emoji: '📖', name: 'Libro', bg: '#FDE68A' },
  { emoji: '💡', name: 'Idea', bg: '#FEF08A' },
  { emoji: '🫂', name: 'Abrazo', bg: '#F9A8D4' },
  { emoji: '🌙', name: 'Luna', bg: '#93C5FD' },
  { emoji: '🧭', name: 'Brújula', bg: '#A5F3FC' },
  { emoji: '📷', name: 'Cámara', bg: '#D9F99D' },
  { emoji: '💭', name: 'Pensamiento', bg: '#E0E7FF' },
  { emoji: '✍️', name: 'Escribiendo', bg: '#FBCFE8' },
];

function svgFor(emoji: string, bg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" rx="28" fill="${bg}" />
    <text x="50%" y="54%" font-size="140" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
}

export function createSeedImages(): SeedImage[] {
  return SEED_ITEMS.map((item, index) => ({
    id: `seed-${index}`,
    name: item.name,
    blob: new Blob([svgFor(item.emoji, item.bg)], { type: 'image/svg+xml' }),
  }));
}
