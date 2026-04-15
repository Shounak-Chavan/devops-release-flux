"use client";

/** * @file ProjectSelector.tsx 
 * @description Enterprise-grade searchable dropdown for switching environments.
 * Styled with the FeatureFlow Obsidian design system.
 */ 

import { useEffect, useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query"; 
import { useRouter } from "next/navigation";
import { 
  ChevronDown, 
  FolderKanban, 
  Loader2, 
  Check, 
  Search,
  PlusCircle
} from "lucide-react";
import { getProjects } from "../api/index"; 
import { useProjectStore } from "../../../store/projectStore";

export default function ProjectSelector() { 
  const router = useRouter();
  const { activeProject, setActiveProject } = useProjectStore(); 
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null); 
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: projects, isLoading } = useQuery({ 
    queryKey: ["projects"], 
    queryFn: getProjects, 
  });

  // Auto-select the first project if none is active
  useEffect(() => { 
    if (projects && projects.length > 0 && !activeProject) { 
      setActiveProject(projects[0]); 
    } 
  }, [projects, activeProject, setActiveProject]);

  // Handle outside clicks and Escape key for accessibility
  useEffect(() => { 
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => { 
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) { 
        setIsOpen(false); 
      } 
    }; 
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside); 
      document.addEventListener("keydown", handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  // Optimized filtering
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  if (isLoading) { 
    return ( 
      <div className="flex h-9 w-48 items-center justify-center rounded-lg" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    ); 
  } 

  return ( 
    <div className="relative" ref={containerRef}> 
      {/* Trigger button */} 
      <button 
        onClick={() => setIsOpen((prev) => !prev)} 
        className="flex h-9 w-48 lg:w-56 items-center justify-between gap-2 rounded-lg px-3 text-sm font-medium transition-all" 
        style={{ 
          background: isOpen ? "var(--card-bg)" : "var(--bg-elevated)", 
          border: `1px solid ${isOpen ? "var(--primary)" : "var(--border-subtle)"}`, 
          color: "var(--text-primary)",
          boxShadow: isOpen ? "0 0 0 3px var(--primary-muted)" : "none",
        }} 
        aria-haspopup="listbox" 
        aria-expanded={isOpen} 
      > 
        <div className="flex items-center gap-2 overflow-hidden">
          <FolderKanban className="h-4 w-4 flex-shrink-0" style={{ color: "var(--primary)" }} /> 
          <span className="truncate"> 
            {activeProject?.name || "Select Project"} 
          </span> 
        </div>
        <ChevronDown 
          className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200" 
          style={{ 
            color: "var(--text-muted)", 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
          }} 
        /> 
      </button> 

      {/* Enhanced Searchable Dropdown */} 
      {isOpen && ( 
        <div 
          className="absolute right-0 top-full mt-2 w-64 lg:w-72 rounded-xl flex flex-col z-50 overflow-hidden animate-fade-in-up" 
          style={{ 
            background: "var(--card-bg)", 
            border: "1px solid var(--card-border)", 
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)", 
            transformOrigin: "top right"
          }} 
        > 
          {/* Search Input Area */}
          <div className="p-2 border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-base)" }}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search environments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md py-1.5 pl-8 pr-3 text-sm outline-none transition-colors"
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--input-border)",
                }}
              />
            </div>
          </div>

          {/* Project List (Scrollable) */}
          <div 
            className="max-h-60 overflow-y-auto p-1"
            role="listbox"
          >
            {filteredProjects.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                No projects found.
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isActive = activeProject?.id === project.id;
                return (
                  <button 
                    key={project.id} 
                    onClick={() => { 
                      setActiveProject(project); 
                      setIsOpen(false); 
                    }} 
                    role="option"
                    aria-selected={isActive}
                    className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors text-left group" 
                    style={{ 
                      background: isActive ? "var(--primary-muted)" : "transparent",
                      color: isActive ? "var(--primary)" : "var(--text-secondary)" 
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "var(--bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  > 
                    <span className="truncate pr-4 font-medium">
                      {project.name}
                    </span>
                    {isActive && <Check className="h-4 w-4 flex-shrink-0" />}
                  </button> 
                )
              })
            )}
          </div>

          {/* Action Footer */}
          <div className="p-1 border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-base)" }}>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/dashboard/projects');
              }}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Manage & Create Projects
            </button>
          </div>
        </div> 
      )} 
    </div> 
  ); 
}