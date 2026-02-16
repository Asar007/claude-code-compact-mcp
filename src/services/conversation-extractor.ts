import type { ConversationMessage, ConversationSummary, CompactedConversation } from '../types/index.js';

interface JsonlEntry {
  type: string;
  message?: {
    role?: string;
    content?: string | Array<{ type: string; text?: string; name?: string }>;
  };
  toolResults?: Array<{ toolName: string }>;
}

/**
 * Extract and summarize conversation from Claude Code session
 */
export class ConversationExtractor {
  /**
   * Parse a Claude Code JSONL transcript file
   */
  parseJsonlTranscript(content: string): ConversationMessage[] {
    const messages: ConversationMessage[] = [];
    const lines = content.split('\n').filter((line) => line.trim());

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as JsonlEntry;
        if (entry.type === 'message' && entry.message) {
          const msg = entry.message;
          if (msg.role && msg.content) {
            const role = msg.role as 'user' | 'assistant' | 'system';
            let textContent = '';

            if (typeof msg.content === 'string') {
              textContent = msg.content;
            } else if (Array.isArray(msg.content)) {
              textContent = msg.content
                .filter((c) => c.type === 'text')
                .map((c) => c.text || '')
                .join('\n');
            }

            if (textContent.trim()) {
              messages.push({ role, content: textContent });
            }
          }
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    return messages;
  }

  /**
   * Extract key information from messages
   */
  extractSummary(messages: ConversationMessage[]): ConversationSummary {
    const allText = messages.map((m) => m.content).join('\n');
    const keyPoints: string[] = [];
    const entities: string[] = [];
    const actions: string[] = [];
    const toolsUsed: Set<string> = new Set();

    // Extract tools from tool_use blocks
    for (const msg of messages) {
      if (msg.role === 'assistant') {
        // Look for tool mentions in assistant messages
        const toolMatches = msg.content.match(/(?:using|calling|invoke)\s+(\w+)/gi);
        if (toolMatches) {
          toolMatches.forEach((m) => {
            const tool = m.split(/\s+/).pop();
            if (tool) toolsUsed.add(tool);
          });
        }
      }
    }

    // Extract topic from first user message
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const topic = firstUserMsg
      ? this.extractTopic(firstUserMsg.content)
      : 'Claude Code Session';

    // Extract key points (sentences with important keywords)
    const keywordPatterns = [
      /\b(implement|create|build|fix|add|update|modify|change|refactor)\b/i,
      /\b(error|bug|issue|problem|solution)\b/i,
      /\b(successfully|completed|done|finished)\b/i,
    ];

    const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    for (const sentence of sentences.slice(0, 50)) {
      if (keywordPatterns.some((p) => p.test(sentence))) {
        const cleanSentence = sentence.trim().slice(0, 200);
        if (cleanSentence && !keyPoints.includes(cleanSentence)) {
          keyPoints.push(cleanSentence);
          if (keyPoints.length >= 10) break;
        }
      }
    }

    // Extract entities (capitalized words, file paths, technical terms)
    const entityPattern = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)+|\w+\.(?:ts|js|py|json|yaml|md))\b/g;
    const matches = allText.match(entityPattern) || [];
    const uniqueEntities = [...new Set(matches)].slice(0, 20);
    entities.push(...uniqueEntities);

    // Extract actions (verb phrases from assistant messages)
    const assistantMsgs = messages.filter((m) => m.role === 'assistant');
    for (const msg of assistantMsgs) {
      const actionPattern = /\b(created|updated|fixed|added|implemented|refactored|deleted|modified)\s+[^.]{5,50}/gi;
      const actionMatches = msg.content.match(actionPattern);
      if (actionMatches) {
        actions.push(...actionMatches.slice(0, 5).map((a) => a.trim()));
        if (actions.length >= 10) break;
      }
    }

    return {
      topic,
      keyPoints: keyPoints.slice(0, 10),
      entities: [...new Set(entities)].slice(0, 15),
      actions: [...new Set(actions)].slice(0, 10),
      messageCount: messages.length,
      toolsUsed: [...toolsUsed],
    };
  }

  /**
   * Extract topic from user message
   */
  private extractTopic(message: string): string {
    // Take first meaningful sentence or phrase
    const firstLine = message.split('\n')[0].trim();
    if (firstLine.length <= 100) return firstLine;
    return firstLine.slice(0, 97) + '...';
  }

  /**
   * Compact a conversation from raw content
   */
  compactConversation(rawContent: string): CompactedConversation {
    const messages = this.parseJsonlTranscript(rawContent);
    const summary = this.extractSummary(messages);

    return {
      summary,
      messages,
      rawContent,
    };
  }

  /**
   * Compact from an array of messages
   */
  compactFromMessages(messages: ConversationMessage[]): CompactedConversation {
    const summary = this.extractSummary(messages);
    return {
      summary,
      messages,
    };
  }
}
