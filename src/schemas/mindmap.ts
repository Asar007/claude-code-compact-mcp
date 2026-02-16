import { z } from 'zod';

export const MindmapNodeDataSchema = z.object({
  label: z.string().min(1).max(50),
  type: z.enum(['root', 'category', 'leaf']),
  summary: z.string().min(1).max(500),
  hoverSummary: z.string().optional(),
  level: z.number().int().min(0).optional(),
});

export const MindmapNodeSchema = z.object({
  id: z.string().min(1),
  data: MindmapNodeDataSchema,
  collapsed: z.boolean().optional(),
});

export const MindmapEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.string().optional(),
});

export const MindmapMetadataSchema = z.object({
  topic: z.string().min(1),
  contentType: z.literal('mindmap'),
  nodeCount: z.number().int().positive(),
});

export const MindmapHierarchySchema = z.record(z.string(), z.array(z.string()));

export const MindmapDataSchema = z.object({
  metadata: MindmapMetadataSchema,
  nodes: z.array(MindmapNodeSchema).min(1),
  edges: z.array(MindmapEdgeSchema),
  hierarchy: MindmapHierarchySchema,
});

export type ValidatedMindmapData = z.infer<typeof MindmapDataSchema>;
