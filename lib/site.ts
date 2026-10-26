export const REPO = 'https://github.com/manishkumarveo-jpg/Elevique-Flow-releases';
export const DOWNLOAD = `${REPO}/releases/latest/download/EleviqueFlow.dmg`;

/** The site lives under /Elevique-Flow-releases on GitHub Pages; plain <video> and <img> URLs need it spelled out. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Deterministic noise, so the server and the browser draw the same bars. */
export const hash = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

export const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The Elevique Flow mark (Logo.swift's LogoMark), in its 100 × 93.5 box. */
export const MARK =
  'M0 10L0 7.2A7.2 7.2 0 0 1 7.2 0L8.9 0C49.6 0 42.7 32.7 75.4 32.7L96 32.7A4 4 0 0 1 100 36.7L100 43.7A4 4 0 0 1 96 47.7L75.6 47.7' +
  'C49.1 47.7 49.6 93.5 11.1 93.5L7.2 93.5A7.2 7.2 0 0 1 0 86.3L0 78.5A4.6 4.6 0 0 1 4.6 73.9L12.1 73.9C34.1 73.9 24.8 55.1 73 40.2' +
  'L62.1 40.2C31.5 40.2 30.8 19.6 4.8 19.6L4.6 19.6A4.6 4.6 0 0 1 0 15ZM0 48.4L0 39.3A2 2 0 0 1 2 37.3L8.5 37.3C25 37.3 37 45.3 41.7 48.4' +
  'C37 51.5 25 59.5 8.5 59.5L2 59.5A2 2 0 0 1 0 57.5Z';
