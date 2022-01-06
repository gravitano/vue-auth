export const normalizeURL = (url: string) => {
  return String(url).startsWith('/') ? url.substr(1) : url;
};
