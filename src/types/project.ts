export type ProjectCategory =
  | "Comercial"
  | "Automotriz"
  | "Evento"
  | "Narrativo"
  | "Documental";

export interface ProjectMetadata {
  year?: string;
  client?: string;
  role?: string;
  duration?: string;
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  featured: boolean;
  metadata?: ProjectMetadata;
}

export interface CategoryFilterItem {
  id: string;
  label: string;
  count?: number;
}
