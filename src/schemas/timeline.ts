import { z } from 'zod';

export const TimelineEventSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().optional(),
});

export const TimelineMetadataSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  contentType: z.literal('timeline'),
});

export const TimelineDataSchema = z.object({
  metadata: TimelineMetadataSchema,
  events: z.array(TimelineEventSchema).min(1),
});

export type ValidatedTimelineData = z.infer<typeof TimelineDataSchema>;
