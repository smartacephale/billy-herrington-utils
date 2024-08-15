import { parseDom } from "../dom";

export const MOBILE_UA = [
  'Mozilla/5.0 (Linux; Android 10; K)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/114.0.0.0 Mobile Safari/537.36'].join(' ');

export function fetchWith(url: string, options: Record<string, boolean> = { html: false, mobile: false }) {
  const reqOpts = {};
  if (options.mobile) Object.assign(reqOpts, { headers: new Headers({ "User-Agent": MOBILE_UA }) });
  return fetch(url, reqOpts).then((r) => r.text()).then(r => options.html ? parseDom(r) : r);
}

export const fetchHtml = (url: string) => fetchWith(url, { html: true });

export const fetchText = (url: string) => fetchWith(url);

export function objectToFormData(object: Record<string, number | boolean | string>): FormData {
  const formData = new FormData();
  Object.entries(object).forEach(([k, v]) => formData.append(k, v as string));
  return formData;
}
