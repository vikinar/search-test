import React from "react";
import styles from "./ResultCard.module.css";
import type { SearchItem } from "@/entities/search/model/types";

export interface ResultCardProps {
  item: SearchItem;
  highlightedTitle?: string;
  highlightedSnippet?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  item,
  highlightedTitle,
  highlightedSnippet,
}) => {
  return (
    <article className={styles.card} aria-labelledby={`res-${item.id}-title`}>
      <h3
        id={`res-${item.id}-title`}
        className={styles.title}
        dangerouslySetInnerHTML={{ __html: highlightedTitle || item.title }}
      />
      <p
        className={styles.snippet}
        dangerouslySetInnerHTML={{ __html: highlightedSnippet || item.snippet }}
      />
    </article>
  );
};

export default ResultCard;
