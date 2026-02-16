import type { CompactedConversation, ConversationMessage, ToolResult } from '../types/index.js';
import { ConversationExtractor } from '../services/conversation-extractor.js';
import { FileService } from '../services/file-service.js';

export interface CompactConversationInput {
  /** Path to JSONL transcript file, or raw conversation content */
  source: string;
  /** Whether source is a file path (true) or raw content (false) */
  isFilePath?: boolean;
}

export interface CompactConversationOutput extends CompactedConversation {
  sourceType: 'file' | 'content';
}

/**
 * Compact conversation tool - extracts and summarizes Claude Code session
 */
export async function compactConversation(
  input: CompactConversationInput
): Promise<ToolResult<CompactConversationOutput>> {
  const extractor = new ConversationExtractor();
  const fileService = new FileService();

  try {
    let rawContent: string;
    let sourceType: 'file' | 'content';

    if (input.isFilePath !== false && input.source.endsWith('.jsonl')) {
      // Read from file
      rawContent = await fileService.readTranscript(input.source);
      sourceType = 'file';
    } else {
      // Use as raw content
      rawContent = input.source;
      sourceType = 'content';
    }

    // Parse and extract
    const compacted = extractor.compactConversation(rawContent);

    return {
      success: true,
      data: {
        ...compacted,
        sourceType,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to compact conversation: ${message}`,
    };
  }
}

/**
 * Compact from messages array (for direct integration)
 */
export function compactFromMessages(
  messages: ConversationMessage[]
): ToolResult<CompactConversationOutput> {
  const extractor = new ConversationExtractor();

  try {
    const compacted = extractor.compactFromMessages(messages);

    return {
      success: true,
      data: {
        ...compacted,
        sourceType: 'content',
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to compact messages: ${message}`,
    };
  }
}
