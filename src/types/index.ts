/**
 * Type definitions for Claude Code Compact MCP Server
 */

// ============================================================================
// Visualization Types
// ============================================================================

export type VisualizationType = 'mindmap' | 'sequence' | 'knowledge_graph' | 'timeline';

// ============================================================================
// Mindmap Types
// ============================================================================

export type MindmapNodeType = 'root' | 'category' | 'leaf';

export interface MindmapNodeData {
  label: string;
  type: MindmapNodeType;
  summary: string;
  hoverSummary?: string;
  level?: number;
}

export interface MindmapNode {
  id: string;
  data: MindmapNodeData;
  collapsed?: boolean;
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface MindmapMetadata {
  topic: string;
  contentType: 'mindmap';
  nodeCount: number;
}

export interface MindmapHierarchy {
  [parentId: string]: string[];
}

export interface MindmapData {
  metadata: MindmapMetadata;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  hierarchy: MindmapHierarchy;
}

// ============================================================================
// Sequence Diagram Types
// ============================================================================

export type ParticipantType = 'Actor' | 'Participant';
export type ArrowType = 'solid' | 'open_arrow';
export type LineType = 'solid' | 'dotted';
export type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'break' | 'critical';

export interface SequenceParticipant {
  id: string;
  label: string;
  type: ParticipantType;
  description?: string;
}

export interface SequenceActivation {
  participant: string;
  startStep: number;
  endStep: number;
}

export interface AltFragment {
  condition: string;
  startStep: number;
  endStep: number;
}

export interface SequenceFragment {
  type: FragmentType;
  startStep: number;
  endStep: number;
  label: string;
  alt_fragments?: AltFragment[];
}

export interface SequenceEvent {
  step: number;
  type: 'message';
  source: string;
  target: string;
  label: string;
  arrowType: ArrowType;
  lineType: LineType;
}

export interface SequenceMetadata {
  title: string;
  summary: string;
}

export interface SequenceDiagramData {
  metadata: SequenceMetadata;
  participants: SequenceParticipant[];
  activations: SequenceActivation[];
  fragments: SequenceFragment[];
  events: SequenceEvent[];
}

// ============================================================================
// Knowledge Graph Types
// ============================================================================

export type KnowledgeGraphNodeType = 'data' | 'backend' | 'frontend' | 'utility';
export type KnowledgeGraphEdgeType = 'establishes' | 'involves' | 'connects' | 'contains' | 'relates';

export interface KnowledgeGraphMetadata {
  projectName: string;
  description?: string;
  version?: string;
  author?: string;
  topic: string;
  contentType: 'knowledge_graph';
}

export interface KnowledgeGraphNodeData {
  label: string;
  type: KnowledgeGraphNodeType;
  description?: string;
  summary: string;
  characteristics?: string[];
  examples?: string[];
}

export interface KnowledgeGraphNode {
  id: string;
  data: KnowledgeGraphNodeData;
  collapsed?: boolean;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type?: KnowledgeGraphEdgeType;
}

export interface KnowledgeGraphHierarchy {
  [parentId: string]: string[];
}

export interface KnowledgeGraphData {
  metadata: KnowledgeGraphMetadata;
  nodes: KnowledgeGraphNode[];
  hierarchy: KnowledgeGraphHierarchy;
  edges: KnowledgeGraphEdge[];
}

// ============================================================================
// Timeline Types
// ============================================================================

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category?: string;
}

export interface TimelineMetadata {
  title: string;
  summary: string;
  contentType: 'timeline';
}

export interface TimelineData {
  metadata: TimelineMetadata;
  events: TimelineEvent[];
}

// ============================================================================
// Conversation Types
// ============================================================================

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ConversationSummary {
  topic: string;
  keyPoints: string[];
  entities: string[];
  actions: string[];
  messageCount: number;
  toolsUsed: string[];
}

export interface CompactedConversation {
  summary: ConversationSummary;
  messages: ConversationMessage[];
  rawContent?: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface NavigateApiConfig {
  baseUrl: string;
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface Thread {
  thread_id: string;
  assistant_id: string;
  status: string;
  metadata: Record<string, unknown>;
  user_id: string;
  created_at: string;
}

export interface ThreadCreate {
  graph_id: string;
  metadata?: Record<string, unknown>;
  initial_state?: Record<string, unknown>;
}

export interface RunCreate {
  input?: Record<string, unknown>;
  config?: Record<string, unknown>;
  stream?: boolean;
  stream_mode?: string | string[];
}

// ============================================================================
// Tool Result Types
// ============================================================================

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type VisualizationData = MindmapData | SequenceDiagramData | KnowledgeGraphData | TimelineData;
