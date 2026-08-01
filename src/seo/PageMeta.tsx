import { useLayoutEffect } from "react";
import {
  SITE_LOCALE,
  SITE_NAME,
  SITE_OG_IMAGE_PATH,
  absoluteUrl,
} from "@/constants/site";
import type { PageSeo } from "@/seo/pages";
import { pageCanonical } from "@/seo/pages";

type PageMetaProps = {
  seo: PageSeo;
  jsonLd?: object | object[];
  noIndex?: boolean;
};

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(data: object | object[] | undefined): void {
  const id = "zeuzyki-jsonld";
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  const payload = Array.isArray(data) ? data : [data];
  let el = existing as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload.length === 1 ? payload[0] : payload);
}

export function PageMeta({ seo, jsonLd, noIndex = false }: PageMetaProps) {
  useLayoutEffect(() => {
    const canonical = pageCanonical(seo.path === "/404" ? "/" : seo.path);
    const ogImage = absoluteUrl(SITE_OG_IMAGE_PATH);

    document.title = seo.title;

    upsertMeta("name", "description", seo.description);
    upsertMeta(
      "name",
      "robots",
      noIndex ? "noindex, nofollow" : "index, follow",
    );

    upsertLink("canonical", canonical);

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", SITE_LOCALE);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);
    upsertMeta("name", "twitter:image", ogImage);

    upsertJsonLd(jsonLd);
  }, [seo, jsonLd, noIndex]);

  return null;
}
