import projectsData from "@/data/projects.json";
import { Project, ProjectCategory } from "@/types/project";

export const allProjects: Project[] = projectsData as Project[];

export function getAllProjects(): Project[] {
  return allProjects;
}

export function getFeaturedProjects(): Project[] {
  return allProjects.filter((p) => p.featured);
}

export function getProjectById(id: string): Project | undefined {
  return allProjects.find((p) => p.id === id);
}

export function getProjectsByCategory(category: string): Project[] {
  if (!category || category.toLowerCase() === "all" || category === "Todos") {
    return allProjects;
  }
  return allProjects.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): string[] {
  const categories = Array.from(new Set(allProjects.map((p) => p.category)));
  return ["Todos", ...categories];
}
