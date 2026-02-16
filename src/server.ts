import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { compactConversation } from './tools/compact-conversation.js';
import { exportJson } from './tools/export-json.js';
import { pushToNavigate } from './tools/push-to-navigate.js';
import type { VisualizationType, VisualizationData } from './types/index.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: 'claude-code-compact',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'compact_conversation',
          description: 'Extract and summarize a Claude Code session from a JSONL transcript file. Returns topic, key points, entities, and actions that can be used to generate a visualization.',
          inputSchema: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'Path to JSONL transcript file, or raw conversation content',
              },
              isFilePath: {
                type: 'boolean',
                description: 'Whether source is a file path (true) or raw content (false). Defaults to true if source ends with .jsonl',
              },
            },
            required: ['source'],
          },
        },
        {
          name: 'export_json',
          description: 'Save visualization JSON to a local file. Default directory is ~/.claude-code-compact/visualizations/',
          inputSchema: {
            type: 'object',
            properties: {
              visualization: {
                type: 'object',
                description: 'Visualization JSON data (mindmap, sequence, knowledge_graph, or timeline)',
              },
              type: {
                type: 'string',
                enum: ['mindmap', 'sequence', 'knowledge_graph', 'timeline'],
                description: 'Type of visualization',
              },
              filename: {
                type: 'string',
                description: 'Optional custom filename (defaults to auto-generated)',
              },
              outputDir: {
                type: 'string',
                description: 'Optional custom output directory',
              },
            },
            required: ['visualization', 'type'],
          },
        },
        {
          name: 'push_to_navigate',
          description: 'Push visualization to Navigate Chat API. Creates a new thread and streams the visualization. Requires NAVIGATE_CHAT_API_URL, NAVIGATE_CHAT_EMAIL, and NAVIGATE_CHAT_PASSWORD environment variables.',
          inputSchema: {
            type: 'object',
            properties: {
              visualization: {
                type: 'object',
                description: 'Visualization JSON data (mindmap, sequence, knowledge_graph, or timeline)',
              },
              metadata: {
                type: 'object',
                description: 'Optional metadata for the thread',
              },
            },
            required: ['visualization'],
          },
        },
      ],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'compact_conversation': {
          const input = args as { source: string; isFilePath?: boolean };
          const result = await compactConversation(input);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'export_json': {
          const input = args as {
            visualization: VisualizationData;
            type: VisualizationType;
            filename?: string;
            outputDir?: string;
          };
          const result = await exportJson(input);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'push_to_navigate': {
          const input = args as {
            visualization: VisualizationData;
            metadata?: Record<string, unknown>;
          };
          const result = await pushToNavigate(input);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Unknown tool: ${name}`,
                }),
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message,
            }),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Start the MCP server with stdio transport
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Claude Code Compact MCP server started');
}
