import React from "react";
import ResultCard from "../ResultCard/ResultCard";
import type { SearchItem } from "@/entities/search/model/types";

export interface ResultsListItem extends SearchItem {
  highlightedTitle?: string;
  highlightedSnippet?: string;
}

export interface ResultsListProps {
  items: ResultsListItem[];
  className?: string;
}

export const ResultsList: React.FC<ResultsListProps> = ({
  items,
  className,
}) => {
  return (
    <div className={className} role="list">
      {items.map((item) => (
        <div role="listitem" key={item.id}>
          <ResultCard
            item={item}
            highlightedTitle={item.highlightedTitle}
            highlightedSnippet={item.highlightedSnippet}
          />
        </div>
      ))}
    </div>
  );
};

export default ResultsList;
