export const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return baseUrl;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${baseUrl}`;
  }

  return baseUrl;
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = getBackendBaseUrl();
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }
  return `${baseUrl}/${path}`;
};
