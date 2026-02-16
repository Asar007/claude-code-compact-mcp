import { z } from 'zod';

export const KnowledgeGraphNodeDataSchema = z.object({
  label: z.string().min(1),
  type: z.enum(['data', 'backend', 'frontend', 'utility']),
  description: z.string().optional(),
  summary: z.string().min(1),
  characteristics: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
});

export const KnowledgeGraphNodeSchema = z.object({
  id: z.string().min(1),
  data: KnowledgeGraphNodeDataSchema,
  collapsed: z.boolean().optional(),
});

export const KnowledgeGraphEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.enum(['establishes', 'involves', 'connects', 'contains', 'relates']).optional(),
});

export const KnowledgeGraphMetadataSchema = z.object({
  projectName: z.string().min(1),
  description: z.string().optional(),
  version: z.string().optional(),
  author: z.string().optional(),
  topic: z.string().min(1),
  contentType: z.literal('knowledge_graph'),
});

export const KnowledgeGraphHierarchySchema = z.record(z.string(), z.array(z.string()));

export const KnowledgeGraphDataSchema = z.object({
  metadata: KnowledgeGraphMetadataSchema,
  nodes: z.array(KnowledgeGraphNodeSchema).min(1),
  hierarchy: KnowledgeGraphHierarchySchema,
  edges: z.array(KnowledgeGraphEdgeSchema),
});

export type ValidatedKnowledgeGraphData = z.infer<typeof KnowledgeGraphDataSchema>;
