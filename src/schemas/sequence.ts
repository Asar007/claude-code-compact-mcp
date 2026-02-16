import { z } from 'zod';

export const SequenceParticipantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['Actor', 'Participant']),
  description: z.string().optional(),
});

export const SequenceActivationSchema = z.object({
  participant: z.string().min(1),
  startStep: z.number().int().min(1),
  endStep: z.number().int().min(1),
});

export const AltFragmentSchema = z.object({
  condition: z.string().min(1),
  startStep: z.number().int().min(1),
  endStep: z.number().int().min(1),
});

export const SequenceFragmentSchema = z.object({
  type: z.enum(['alt', 'opt', 'loop', 'par', 'break', 'critical']),
  startStep: z.number().int().min(1),
  endStep: z.number().int().min(1),
  label: z.string().min(1),
  alt_fragments: z.array(AltFragmentSchema).optional(),
});

export const SequenceEventSchema = z.object({
  step: z.number().int().min(1),
  type: z.literal('message'),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().min(1),
  arrowType: z.enum(['solid', 'open_arrow']),
  lineType: z.enum(['solid', 'dotted']),
});

export const SequenceMetadataSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
});

export const SequenceDiagramDataSchema = z.object({
  metadata: SequenceMetadataSchema,
  participants: z.array(SequenceParticipantSchema).min(2),
  activations: z.array(SequenceActivationSchema),
  fragments: z.array(SequenceFragmentSchema),
  events: z.array(SequenceEventSchema).min(1),
});

export type ValidatedSequenceDiagramData = z.infer<typeof SequenceDiagramDataSchema>;
