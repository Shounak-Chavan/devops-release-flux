import { api } from '../../../config/api';

export interface Project {
  id: string;
  name: string;
  description: string;
  api_key: string;
  created_at: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data.data;
};

export const createProject = async (data: { name: string; description?: string }) => {
  const response = await api.post('/projects', data);
  return response.data.data;
};