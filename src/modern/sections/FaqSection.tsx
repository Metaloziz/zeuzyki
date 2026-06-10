import { useState } from "react";
import { FAQ_ITEMS } from "@/data/faq";
import { SECTION_IDS } from "@/modern/constants/sections";
import { useGsapSectionReveal } from "@/modern/hooks/useGsapSectionReveal";
import { SectionShell } from "@/modern/components/SectionShell";
import shellStyles from "@/modern/components/SectionShell.module.css";
import styles from "./FaqSection.module.css";

export function FaqSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const listRef = useGsapSectionReveal<HTMLDivElement>({ stagger: 0.05, y: 24 });

  const toggle = (question: string) => {
    setOpenItems((current) => ({
      ...current,
      [question]: !current[question],
    }));
  };

  return (
    <SectionShell id={SECTION_IDS.faq}>
      <div className={styles.wrap}>
        <div className={styles.header} data-reveal>
          <p className={shellStyles.eyebrow}>FAQ</p>
          <h2 className={shellStyles.title}>Популярные вопросы</h2>
          <p className={shellStyles.lead}>
            Всё, что нужно знать перед первым сплавом.
          </p>
        </div>

        <div ref={listRef} className={styles.list}>
          {FAQ_ITEMS.map((item) => {
            const isOpen = Boolean(openItems[item.question]);
            return (
              <article
                key={item.question}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
                data-reveal
              >
                <button
                  type="button"
                  className={styles.question}
                  aria-expanded={isOpen}
                  onClick={() => toggle(item.question)}
                >
                  <span>{item.question}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </button>
                <div className={styles.answer} aria-hidden={!isOpen}>
                  <div className={styles.answerInner}>{item.answer}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
