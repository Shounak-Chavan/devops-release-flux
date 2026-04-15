import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase'; // Your client-side supabase instance
import { useProjectStore } from '@/store/projectStore';

export const useFlagRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { activeProject } = useProjectStore();

  useEffect(() => {
    if (!activeProject) return;

    // Listen directly to Supabase changes for this project's flags
    const channel = supabase
      .channel(`public:feature_flags:project_id=eq.${activeProject.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, 
        (payload) => {
          // Instantly trigger a background refetch when the DB changes
          queryClient.invalidateQueries({ queryKey: ["flags", activeProject.id] });
          queryClient.invalidateQueries({ queryKey: ["usage", activeProject.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeProject, queryClient]);
};