"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { evaluateRulesLocally } from './rulesEngine';
// --- Global Analytics Buffer ---
// Collects evaluations in memory to avoid hammering the DB with every re-render
const evaluationBuffer = {};
const FeatureFlowContext = createContext(undefined);
export const FeatureFlowProvider = ({ apiKey, userContext = {}, apiUrl = 'http://localhost:8000/api/v1', children }) => {
    const [ruleset, setRuleset] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const [connectionState, setConnectionState] = useState('connecting');
    const cacheKey = useMemo(() => `ff_rules_${apiKey}`, [apiKey]);
    // 1. SSE Connection & Cache Management
    useEffect(() => {
        if (!apiKey || typeof window === 'undefined')
            return;
        setConnectionState('connecting');
        // Load offline fallback from localStorage for instant initial render
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                setRuleset(JSON.parse(cached));
                setIsReady(true);
            }
            catch (e) {
                console.warn('[FeatureFlow] Cache corruption detected');
            }
        }
        // Connect to the optimized SSE stream
        const eventSource = new EventSource(`${apiUrl}/sdk/stream?apiKey=${apiKey}`);
        eventSource.onopen = () => setConnectionState('connected');
        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                // Handle both initial sync and real-time updates
                if (payload.type === 'RULESET_SYNC' || payload.type === 'RULESET_UPDATED') {
                    const newRules = payload.data;
                    setRuleset(newRules);
                    localStorage.setItem(cacheKey, JSON.stringify(newRules));
                    setIsReady(true);
                }
            }
            catch (err) {
                console.error('[FeatureFlow] Failed to parse stream update', err);
            }
        };
        eventSource.onerror = () => {
            setConnectionState('error');
            eventSource.close();
        };
        return () => eventSource.close();
    }, [apiKey, apiUrl, cacheKey]);
    // 2. Analytics Background Worker
    // Flushes the evaluationBuffer to the server every 10 seconds
    useEffect(() => {
        if (!apiKey || typeof window === 'undefined')
            return;
        const flushInterval = setInterval(() => {
            const flagIds = Object.keys(evaluationBuffer);
            if (flagIds.length === 0)
                return;
            const payload = { ...evaluationBuffer };
            // Clear buffer immediately to prevent double-counting during async fetch
            flagIds.forEach(id => delete evaluationBuffer[id]);
            // Route: /api/v1/track
            const trackUrl = apiUrl.endsWith('/stream')
                ? apiUrl.replace('/stream', '/usage/track')
                : `${apiUrl}/usage/track`;
            fetch(trackUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ evaluations: payload }),
                keepalive: true
            }).catch(err => console.error('[FeatureFlow] Analytics sync failed', err));
        }, 10000);
        return () => clearInterval(flushInterval);
    }, [apiKey, apiUrl]);
    const value = useMemo(() => ({
        ruleset,
        isReady,
        connectionState,
        userContext
    }), [ruleset, isReady, connectionState, userContext]);
    return (_jsx(FeatureFlowContext.Provider, { value: value, children: children }));
};
// --- Hooks ---
/**
 * useFeatureFlag
 * Evaluates a flag locally and queues the result for analytics tracking.
 */
export const useFeatureFlag = (flagName, defaultValue = false) => {
    const context = useContext(FeatureFlowContext);
    const isEnabled = useMemo(() => {
        if (!context || !context.isReady)
            return defaultValue;
        const flag = context.ruleset.find(f => f.name === flagName);
        if (!flag)
            return defaultValue;
        if (!flag.status)
            return false;
        // Evaluate targeting rules (rollout, attributes, etc.)
        return evaluateRulesLocally(context.userContext, flag.targeting_rules, flag.id);
    }, [context, flagName, defaultValue]);
    // Track the evaluation silently
    useEffect(() => {
        if (!context?.isReady)
            return;
        const flag = context.ruleset.find(f => f.name === flagName);
        if (flag) {
            evaluationBuffer[flag.id] = (evaluationBuffer[flag.id] || 0) + 1;
        }
    }, [context, flagName, isEnabled]);
    return isEnabled;
};
