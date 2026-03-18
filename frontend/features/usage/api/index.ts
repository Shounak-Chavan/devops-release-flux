import { api } from '@/config/api';

export interface UsageStats {
  month: string;
  evaluations: number;
  limit: number;
  percentageUsed: string;
}

export const getProjectUsage = async (projectId: string): Promise<UsageStats> => {
  const response = await api.get(`/usage/project/${projectId}`);
  return response.data; 
};