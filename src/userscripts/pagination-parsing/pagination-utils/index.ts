export function getPaginationLinks(
  doc: Element | HTMLElement | Document = document,
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
      const linkUrl = new URL(h.replace(/#\w*$/, ''), doc.baseURI || currentUrl.origin);
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

export function upgradePathname(curr: URL, links: URL[]): URL {
  // curr: website.com, links: [webiste.com/new/23], res: wegsite.com/new
  if (/\/(page\/)?\d+\/?$/.test(curr.pathname) || links.length < 1) return curr;
  const linksDepaginated = links.map((l) => {
    l.pathname = l.pathname.replace(/\/(page\/)?\d+\/?$/, '/');
    return l;
  });
  if (linksDepaginated.some((l) => l.pathname === curr.pathname)) return curr;
  const last = linksDepaginated.at(-1) as URL;
  if (last.pathname !== curr.pathname) curr.pathname = last.pathname;
  return curr;
}
