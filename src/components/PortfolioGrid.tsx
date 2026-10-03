"use client";

import React, { useMemo } from "react";
import { Project } from "@/types/project";
import { VideoCard } from "./VideoCard";
import { CategoryFilter } from "./CategoryFilter";
import { Film } from "lucide-react";

interface PortfolioGridProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function PortfolioGrid({
  projects,
  onSelectProject,
  selectedCategory,
  onCategoryChange,
}: PortfolioGridProps) {
  // Extract categories and counts
  const { categories, categoryCounts } = useMemo(() => {
    const cats = Array.from(new Set(projects.map((p) => p.category)));
    const allCategories = ["Todos", ...cats];

    const counts: Record<string, number> = {
      Todos: projects.length,
    };
    cats.forEach((cat) => {
      counts[cat] = projects.filter((p) => p.category === cat).length;
    });

    return { categories: allCategories, categoryCounts: counts };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!selectedCategory || selectedCategory === "Todos") {
      return projects;
    }
    return projects.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [projects, selectedCategory]);

  return (
    <section id="portfolio" className="relative w-full py-24 sm:py-32 px-6 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-neutral-900/80 text-[11px] font-mono tracking-widest uppercase text-neutral-400 mb-4">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <span>Catálogo de Producciones</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Trabajos Seleccionados
        </h2>

        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl font-light">
          Una muestra de piezas comerciales, automotrices y narrativas dirigidas con rigor visual, iluminación natural y lentes de cine.
        </p>

        {/* Category Filters */}
        <div className="mt-8 w-full">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={onCategoryChange}
            counts={categoryCounts}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => (
            <VideoCard
              key={project.id}
              project={project}
              onSelectProject={onSelectProject}
              priority={index < 2}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
          <p className="text-neutral-400 text-sm">
            No se encontraron producciones en esta categoría.
          </p>
          <button
            onClick={() => onCategoryChange("Todos")}
            className="mt-4 text-xs font-semibold uppercase text-amber-400 hover:underline"
          >
            Ver todos los proyectos
          </button>
        </div>
      )}
    </section>
  );
}
