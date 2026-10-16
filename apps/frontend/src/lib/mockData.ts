// mockData.ts — All data now served from the real API at api.kunamix.com/api/v1/
// This file is kept only for import compatibility. No mock data.

import { AITool, Category } from "./types";

export const MOCK_TOOLS: AITool[] = [];
export const MOCK_CATEGORIES: Category[] = [];

export const getFeaturedTools = (): AITool[] => [];
export const getTrendingTools = (): AITool[] => [];
export const getToolBySlug = (_slug: string): AITool | undefined => undefined;
export const getToolsByCategory = (_category: string): AITool[] => [];
export const searchTools = (_query: string): AITool[] => [];
