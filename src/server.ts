import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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
        prompts: {},
      },
    }
  );

  // Register prompts list handler
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'compact',
          description: 'Analyze the current conversation and create a visualization (mindmap, sequence diagram, knowledge graph, or timeline)',
          arguments: [
            {
              name: 'type',
              description: 'Visualization type: mindmap, sequence, knowledge_graph, or timeline',
              required: false,
            },
          ],
        },
      ],
    };
  });

  // Register get prompt handler
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'compact') {
      const vizType = (args?.type as string) || 'mindmap';

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Analyze our ENTIRE conversation above and create a ${vizType} visualization.

INSTRUCTIONS:
1. Read through ALL messages in this conversation
2. Identify the main topic, key points, entities mentioned, and actions taken
3. Create a ${vizType} JSON structure following this format:

${vizType === 'mindmap' ? `{
  "title": "Conversation Topic",
  "type": "mindmap",
  "root": {
    "content": "Main Topic",
    "children": [
      {
        "content": "Subtopic 1",
        "children": [
          {"content": "Detail 1"},
          {"content": "Detail 2"}
        ]
      },
      {
        "content": "Subtopic 2",
        "children": [...]
      }
    ]
  }
}` : vizType === 'sequence' ? `{
  "title": "Process Flow",
  "type": "sequence",
  "participants": ["User", "Assistant", "System"],
  "messages": [
    {"from": "User", "to": "Assistant", "content": "Request"},
    {"from": "Assistant", "to": "System", "content": "Action"},
    {"from": "System", "to": "Assistant", "content": "Result"}
  ]
}` : vizType === 'knowledge_graph' ? `{
  "title": "Knowledge Graph",
  "type": "knowledge_graph",
  "nodes": [
    {"id": "1", "label": "Entity 1", "type": "concept"},
    {"id": "2", "label": "Entity 2", "type": "action"}
  ],
  "edges": [
    {"from": "1", "to": "2", "label": "relates to"}
  ]
}` : `{
  "title": "Timeline",
  "type": "timeline",
  "events": [
    {"date": "Step 1", "title": "First Action", "description": "What happened"},
    {"date": "Step 2", "title": "Second Action", "description": "What happened"}
  ]
}`}

4. After generating the JSON, call the export_json tool to save it locally

IMPORTANT: Read the ENTIRE conversation history, not just the last message. Include all key topics discussed.`,
            },
          },
        ],
      };
    }

    throw new Error(`Unknown prompt: ${name}`);
  });

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'compact_conversation',
          description: 'Extract and summarize a Claude conversation. Supports multiple formats: (1) Claude Code CLI JSONL transcripts, (2) Plain text conversations copied from Claude Desktop/Web (Human:/Assistant: format). Returns topic, key points, entities, and actions for visualization.',
          inputSchema: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'Path to JSONL transcript file, OR pasted conversation text (Human:/Assistant: format from Claude Desktop/Web)',
              },
              isFilePath: {
                type: 'boolean',
                description: 'Whether source is a file path (true) or raw content (false). Auto-detects if source ends with .jsonl',
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
