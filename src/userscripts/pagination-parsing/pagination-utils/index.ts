export function getPaginationLinks(
  doc: HTMLElement | Document = document,
  url: Location | URL | string = location.href,
  pathnameSelector = /\/(page\/)?\d+\/?$/,
): string[] {
  const currentUrl = parseURL(url);
  currentUrl.pathname = currentUrl.pathname.replace(pathnameSelector, '/');
  const pageLinks = Array.from(
    (doc.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>) || [],
    (a) => a.href,
  ).filter((h) => {
    try {
      const linkUrl = new URL(h.replace(/#$/, ''), doc.baseURI || currentUrl.origin);
      return (
        linkUrl.origin === currentUrl.origin && linkUrl.pathname.startsWith(currentUrl.pathname)
      );
    } catch {
      return false;
    }
  });
  return pageLinks;
}

export function parseURL(s: HTMLAnchorElement | Location | URL | string): URL {
  if (typeof s === 'string') return new URL(s);
  return new URL(s.href);
}
