"use client";

import React from "react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  counts?: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  counts,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4">
      {categories.map((category) => {
        const isSelected =
          selectedCategory.toLowerCase() === category.toLowerCase() ||
          (selectedCategory === "" && category === "Todos");
        const count = counts ? counts[category] : undefined;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 focus:outline-none ${
              isSelected
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105"
                : "bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-white/10"
            }`}
          >
            <span>{category}</span>
            {count !== undefined && (
              <span
                className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-black/20 text-black"
                    : "bg-white/10 text-neutral-400"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
