import { api } from '@/config/api';

export interface FeatureFlag {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
}

export const getFlagsByProject = async (projectId: string): Promise<FeatureFlag[]> => {
  const response = await api.get(`/flags/project/${projectId}`);
  return response.data.data;
};

export const createFlag = async (data: { projectId: string; name: string; description?: string }) => {
  const response = await api.post('/flags', data);
  return response.data.data;
};

export const toggleFlag = async (flagId: string) => {
  const response = await api.patch(`/flags/${flagId}/toggle`);
  return response.data.data;
};

export interface TargetingRule {
  id: string;
  attribute: string;
  operator: string;
  value: string;
  rollout_percentage: number;
}

export interface FeatureFlagDetails extends FeatureFlag {
  targeting_rules: TargetingRule[];
}

export const getFlagById = async (flagId: string): Promise<FeatureFlagDetails> => {
  const response = await api.get(`/flags/${flagId}`);
  return response.data.data;
};

export const addTargetingRule = async (data: { flagId: string; attribute: string; operator: string; value: string; rolloutPercentage: number }) => {
  const response = await api.post(`/flags/${data.flagId}/rules`, {
    attribute: data.attribute,
    operator: data.operator,
    value: data.value,
    rolloutPercentage: data.rolloutPercentage
  });
  return response.data.data;
};

export const removeTargetingRule = async (data: { flagId: string; ruleId: string }) => {
  const response = await api.delete(`/flags/${data.flagId}/rules/${data.ruleId}`);
  return response.data;
};


export interface AuditLog {
  id: string;
  action: string;
  created_at: string;
  previous_state: any;
  new_state: any;
  users?: { email: string };
}

export const getFlagAuditLogs = async (flagId: string): Promise<AuditLog[]> => {
  const response = await api.get(`/flags/${flagId}/logs`);
  return response.data.data;
};

export const rollbackFlag = async (flagId: string) => {
  const response = await api.post(`/flags/${flagId}/rollback`);
  return response.data.data;
};