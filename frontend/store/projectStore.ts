import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '../features/project/api/index';

interface ProjectState {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      setActiveProject: (project) => set({ activeProject: project }),
    }),
    {
      name: 'featureflow-project-storage', // Key used in localStorage
    }
  )
);