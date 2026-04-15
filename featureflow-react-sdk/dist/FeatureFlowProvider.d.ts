import React, { ReactNode } from 'react';
interface UserContext {
    id?: string;
    [key: string]: any;
}
interface FeatureFlowProviderProps {
    apiKey: string;
    userContext?: UserContext;
    apiUrl?: string;
    children: ReactNode;
}
export declare const FeatureFlowProvider: React.FC<FeatureFlowProviderProps>;
/**
 * useFeatureFlag
 * Evaluates a flag locally and queues the result for analytics tracking.
 */
export declare const useFeatureFlag: (flagName: string, defaultValue?: boolean) => boolean;
export {};
