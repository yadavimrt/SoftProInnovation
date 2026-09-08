import { API_BASE_URL } from '../config/api';

const DEFAULT_FALLBACK = 'https://placehold.co/400x400?text=No+Image';

/**
 * Normalizes image paths to full URLs or passes through local/external URLs.
 * @param {string} imgPath 
 * @param {string} [fallback] 
 * @returns {string}
 */
export const formatImg = (imgPath, fallback = DEFAULT_FALLBACK) => {
  if (!imgPath || typeof imgPath !== 'string') return fallback;
  const trimmed = imgPath.trim();
  if (!trimmed) return fallback;

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/src/') ||
    trimmed.startsWith('/@fs/') ||
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('src/')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanPath}`;
};

export default formatImg;
