# Claude Code Compact MCP

An MCP (Model Context Protocol) server that helps compact Claude Code conversations into Navigate Chat-compatible visualizations.

## Overview

This lightweight MCP server provides utility tools for:
- **Parsing** Claude Code JSONL transcripts
- **Exporting** visualization JSON to local files
- **Pushing** visualizations to Navigate Chat API

**Key Design:** Claude Code generates the visualization JSON directly using the included `skill.md` prompt. No external LLM API calls needed.

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/claude-code-compact-mcp.git
cd claude-code-compact-mcp
npm install
npm run build
```

## Quick Start

### 1. Add to Claude Code

Add this to your Claude Code MCP settings (`~/.claude.json`):

```json
{
  "mcpServers": {
    "claude-code-compact": {
      "command": "node",
      "args": ["/path/to/claude-code-compact-mcp/dist/index.js"]
    }
  }
}
```

### 2. (Optional) Configure Navigate Chat API

Only needed if you want to push visualizations to Navigate Chat:

```json
{
  "mcpServers": {
    "claude-code-compact": {
      "command": "node",
      "args": ["/path/to/claude-code-compact-mcp/dist/index.js"],
      "env": {
        "NAVIGATE_CHAT_API_URL": "http://localhost:8000",
        "NAVIGATE_CHAT_EMAIL": "your-email",
        "NAVIGATE_CHAT_PASSWORD": "your-password"
      }
    }
  }
}
```

### 3. Use It

In Claude Code, just say:
```
compact this conversation
```

Claude Code will generate a visualization JSON and can save/push it using the MCP tools.

## Tools

| Tool | Description |
|------|-------------|
| `compact_conversation` | Parse JSONL transcript → extract topic, key points, entities, actions |
| `export_json` | Save visualization JSON to `~/.claude-code-compact/visualizations/` |
| `push_to_navigate` | Push visualization to Navigate Chat API |

### compact_conversation

Extracts structured information from a Claude Code session.

```typescript
// Input
{ source: "path/to/transcript.jsonl" }

// Output
{
  topic: "Main discussion topic",
  keyPoints: ["point1", "point2"],
  entities: ["file.ts", "ComponentName"],
  actions: ["created X", "fixed Y"],
  messageCount: 42
}
```

### export_json

Saves visualization to a local file.

```typescript
// Input
{
  visualization: { /* mindmap/sequence/graph/timeline JSON */ },
  type: "mindmap"
}

// Output
{
  filePath: "/home/user/.claude-code-compact/visualizations/mindmap_topic_2024-01-15.json",
  filename: "mindmap_topic_2024-01-15.json"
}
```

### push_to_navigate

Pushes visualization to Navigate Chat.

```typescript
// Input
{ visualization: { /* JSON */ } }

// Output
{
  threadId: "abc-123",
  threadUrl: "http://navigatechat.com/chat/abc-123",
  success: true
}
```

## Visualization Types

The `skill.md` file contains complete instructions for generating:

### Mindmap
Hierarchical topic exploration with root → categories → leaves.

### Sequence Diagram
Process flows showing interactions between participants.

### Knowledge Graph
3-level tree structure for entity relationships.

### Timeline
Chronological events with dates and descriptions.

## Project Structure

```
claude-code-compact-mcp/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # MCP server setup
│   ├── tools/
│   │   ├── compact-conversation.ts
│   │   ├── export-json.ts
│   │   └── push-to-navigate.ts
│   ├── services/
│   │   ├── conversation-extractor.ts
│   │   ├── file-service.ts
│   │   └── navigate-api-client.ts
│   ├── schemas/                 # Zod validation
│   └── types/
├── skill.md                     # LLM prompt for generating visualizations
├── package.json
└── tsconfig.json
```

## Development

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## How It Works

1. User asks Claude Code to "compact this conversation"
2. Claude Code reads `skill.md` to understand the JSON formats
3. Claude Code analyzes the conversation and generates appropriate visualization JSON
4. Claude Code calls `export_json` to save locally
5. Optionally calls `push_to_navigate` to upload to Navigate Chat

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│   skill.md      │────▶│  Generate JSON  │
│   (User asks)   │     │   (Instructions)│     │  (No API call)  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        ▼                                ▼                                ▼
               ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
               │  export_json    │              │ push_to_navigate│              │  Return to user │
               │  (Save file)    │              │  (Upload API)   │              │  (Display JSON) │
               └─────────────────┘              └─────────────────┘              └─────────────────┘
```

## Requirements

- Node.js 18+
- Claude Code with MCP support

## License

MIT

## Related

- [Navigate Chat](https://navigatechat.com) - Visualization platform
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification
- [Claude Code](https://claude.ai/code) - Anthropic's CLI for Claude
