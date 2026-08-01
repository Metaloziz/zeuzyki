import {
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  TELEGRAM_URL,
} from "@/constants/contacts";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/constants/site";
import { FAQ_SEO_ITEMS } from "@/data/faqSeo";

export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: SITE_NAME,
    description: SITE_DEFAULT_DESCRIPTION,
    url: SITE_URL,
    telephone: PHONE_DISPLAY,
    image: absoluteUrl("/og-image.jpg"),
    areaServed: [
      { "@type": "City", name: "Минск" },
      { "@type": "City", name: "Молодечно" },
      { "@type": "Country", name: "Беларусь" },
    ],
    address: {
      "@type": "PostalAddress",
      addressRegion: "Минская область",
      addressCountry: "BY",
    },
    sameAs: [INSTAGRAM_URL, TELEGRAM_URL],
  };
}

export function buildFaqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SEO_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildHomeJsonLd() {
  return [buildLocalBusinessJsonLd(), buildFaqPageJsonLd()];
}
