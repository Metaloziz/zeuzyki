import { useState } from "react";
import { FAQ_ITEMS } from "@/data/faq";
import { PageMeta } from "@/seo/PageMeta";
import { buildFaqPageJsonLd } from "@/seo/jsonLd";
import { FAQ_SEO } from "@/seo/pages";
import styles from "./Faq.module.css";

const faqJsonLd = buildFaqPageJsonLd();

export function Faq() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (question: string) => {
    setOpenItems((current) => ({
      ...current,
      [question]: !current[question],
    }));
  };

  return (
    <main className={styles.page}>
      <PageMeta seo={FAQ_SEO} jsonLd={faqJsonLd} />
      <div className={styles.container}>
        <h1 className={styles.title}>Популярные вопросы</h1>

        <div className={styles.listWrapper}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = Boolean(openItems[item.question]);
            const answerId = `faq-answer-${index}`;

            return (
              <section
                className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
                key={item.question}
              >
                <h2 className={styles.questionTitle}>
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleItem(item.question)}
                  >
                    <span>{item.question}</span>
                    <span className={styles.icon} aria-hidden="true" />
                  </button>
                </h2>
                <div
                  className={styles.content}
                  id={answerId}
                  aria-hidden={!isOpen}
                >
                  <div className={styles.contentInner}>{item.answer}</div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
