export function parseDom(html: string): HTMLElement {
  const parsed = new DOMParser().parseFromString(html, 'text/html').body;
  return parsed.children.length > 1 ? parsed : parsed.firstElementChild as HTMLElement;
}

export function copyAttributes(target: HTMLElement | Element, source: HTMLElement | Element) {
  for (const attr of source.attributes) {
    attr.nodeValue && target.setAttribute(attr.nodeName, attr.nodeValue);
  }
}

export function replaceElementTag(e: HTMLElement | Element, tagName: string) {
  const newTagElement = document.createElement(tagName);
  copyAttributes(newTagElement, e);
  newTagElement.innerHTML = e.innerHTML;
  e.parentNode?.replaceChild(newTagElement, e);
  return newTagElement;
}

export function getAllUniqueParents(elements: HTMLCollection): Array<HTMLElement | Element> {
  return Array.from(elements).reduce((acc, v) => {
    if (v.parentElement && acc.includes(v.parentElement as HTMLElement)) { acc.push(v.parentElement); }
    return acc;
  }, [] as Array<HTMLElement | Element>);
}

export function findNextSibling(el: HTMLElement | Element) {
  if (el.nextElementSibling) return el.nextElementSibling;
  if (el.parentElement) return findNextSibling(el.parentElement);
  return null;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function waitForElementExists(parent: HTMLElement | Element, selector: string, callback: any): void {
  const observer = new MutationObserver((_mutations) => {
    const el = parent.querySelector(selector);
    if (el) {
      observer.disconnect();
      callback(el);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function watchElementChildrenCount(element: HTMLElement | Element, callback: any): void {
  let count = element.children.length;
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        if (count !== element.children.length) {
          count = element.children.length;
          callback(observer, count);
        }
      }
    }
  });
  observer.observe(element, { childList: true });
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function watchDomChangesWithThrottle(element: HTMLElement | Element, callback: any,
  throttle = 1000, options: Record<string, boolean> = { childList: true, subtree: true, attributes: true }) {
  let lastMutationTime: number;
  let timeout: number;
  const observer = new MutationObserver((_mutationList, _observer) => {
    const now = Date.now();
    if (lastMutationTime && now - lastMutationTime < throttle) {
      timeout && clearTimeout(timeout);
    }
    timeout = setTimeout(callback, throttle);
    lastMutationTime = now;
  });
  observer.observe(element, options);
}

export function downloader(options = { append: "", after: "", button: "", cbBefore: () => { } }) {
  const btn = parseDom(options.button);

  if (options.append) document.querySelector(options.append)?.append(btn);
  if (options.after) document.querySelector(options.after)?.after(btn);

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    if (options.cbBefore) options.cbBefore();

    waitForElementExists(document.body, 'video', (video: HTMLVideoElement) => {
      window.location.href = video.getAttribute('src') as string;
    });
  });
}