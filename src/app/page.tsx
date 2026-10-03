"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { VideoModal } from "@/components/VideoModal";
import { Footer } from "@/components/Footer";
import { getAllProjects } from "@/lib/projects";
import { Project } from "@/types/project";
import { Award, Camera, Film, Layers } from "lucide-react";

export default function Home() {
  const [projects] = useState<Project[]>(getAllProjects());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Fullscreen Hero Section */}
        <HeroSection />

        {/* Studio Highlight Stats Ribbon */}
        <section
          id="about"
          className="relative w-full border-y border-white/10 bg-neutral-950/80 backdrop-blur-md py-12 px-6 sm:px-8"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Camera className="w-6 h-6 text-amber-400 mb-3" />
              <span className="text-3xl font-extrabold text-white tracking-tight">
                8K RAW
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                Adquisición Óptica
              </span>
            </div>

            <div className="flex flex-col items-center">
              <Film className="w-6 h-6 text-amber-400 mb-3" />
              <span className="text-3xl font-extrabold text-white tracking-tight">
                +140
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                Rodajes Comerciales
              </span>
            </div>

            <div className="flex flex-col items-center">
              <Award className="w-6 h-6 text-amber-400 mb-3" />
              <span className="text-3xl font-extrabold text-white tracking-tight">
                12
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                Premios de Festival
              </span>
            </div>

            <div className="flex flex-col items-center">
              <Layers className="w-6 h-6 text-amber-400 mb-3" />
              <span className="text-3xl font-extrabold text-white tracking-tight">
                ACES
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                Color Management
              </span>
            </div>
          </div>
        </section>

        {/* Portfolio Gallery Section */}
        <PortfolioGrid
          projects={projects}
          onSelectProject={handleSelectProject}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Fullscreen Video Screening Modal */}
      <VideoModal project={selectedProject} onClose={handleCloseModal} />
    </div>
  );
}
