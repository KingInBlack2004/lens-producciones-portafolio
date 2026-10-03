"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { VideoModal } from "@/components/VideoModal";
import { Footer } from "@/components/Footer";
import { getAllProjects } from "@/lib/projects";
import { Project } from "@/types/project";

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
