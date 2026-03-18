"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, FolderKanban, Loader2 } from "lucide-react";
import { getProjects } from "../api/index";
import { useProjectStore } from "../../../store/projectStore";

export default function ProjectSelector() {
  const { activeProject, setActiveProject } = useProjectStore();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // Automatically select the first project if none is selected and projects exist
  useEffect(() => {
    if (projects && projects.length > 0 && !activeProject) {
      setActiveProject(projects[0]);
    }
  }, [projects, activeProject, setActiveProject]);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
  }

  if (!projects || projects.length === 0) {
    return <span className="text-sm text-gray-500">No projects yet</span>;
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
        <FolderKanban className="h-4 w-4 text-gray-500" />
        {activeProject?.name || "Select Project"}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {/* Simple CSS Dropdown on Hover */}
      <div className="absolute left-0 top-full mt-1 hidden w-48 flex-col rounded-lg border border-gray-200 bg-white p-1 shadow-lg group-hover:flex z-50">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setActiveProject(project)}
            className={`flex w-full items-center px-3 py-2 text-left text-sm rounded-md transition-colors ${
              activeProject?.id === project.id
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {project.name}
          </button>
        ))}
      </div>
    </div>
  );
}