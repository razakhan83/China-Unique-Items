const CLOUDINARY_HOSTS = new Set(['res.cloudinary.com']);

export function optimizeCloudinaryUrl(url = '') {
  const source = String(url || '').trim();
  if (!source) return '';

  try {
    const parsed = new URL(source);
    if (!CLOUDINARY_HOSTS.has(parsed.hostname)) {
      return source;
    }

    const uploadSegment = '/image/upload/';
    if (!parsed.pathname.includes(uploadSegment)) {
      return source;
    }

    if (parsed.pathname.includes('/image/upload/f_avif,q_auto/')) {
      return source;
    }

    parsed.pathname = parsed.pathname.replace(
      uploadSegment,
      '/image/upload/f_avif,q_auto/',
    );

    return parsed.toString();
  } catch {
    return source;
  }
}

export function optimizeCloudinaryAsset(asset) {
  if (!asset || typeof asset !== 'object') return asset;

  return {
    ...asset,
    url: optimizeCloudinaryUrl(asset.url),
  };
}
