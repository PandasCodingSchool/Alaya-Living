export function apiPublicUrl() {
  return process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
}

export function publicMediaUrl(url?: string | null) {
  if (!url) return url ?? null;
  if (url.startsWith('data:') || url.startsWith('/')) return url;

  const prefixes = [
    process.env.S3_PUBLIC_URL || 'http://localhost:9000/fmr-uploads',
    'http://localhost:9000/fmr-uploads',
  ];
  for (const prefix of prefixes) {
    if (url.startsWith(`${prefix}/`)) {
      return `${apiPublicUrl()}/files/${url.slice(prefix.length + 1)}`;
    }
  }
  return url;
}
