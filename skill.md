# Skill: Compact Conversation to Visualization

Use this skill when the user asks to "compact", "visualize", "summarize as diagram", or "export" the current conversation into a Navigate Chat visualization format.

## When to Use

- User says: "compact this conversation"
- User says: "create a visualization of our session"
- User says: "export this as a mindmap/sequence/graph/timeline"
- User says: "summarize this conversation visually"

## Process

### Step 1: Analyze the Conversation

Review the conversation and extract:
- **Topic**: Main subject (1-4 words)
- **Key Points**: 5-10 most important insights or decisions
- **Entities**: Technical terms, files, components mentioned
- **Actions**: What was done (created, fixed, implemented, etc.)
- **Flow**: Was this a process/sequence or exploration/brainstorming?

### Step 2: Select Visualization Type

Choose based on conversation nature:

| Type | When to Use |
|------|-------------|
| `mindmap` | Brainstorming, exploring topics, pros/cons, feature breakdowns, general discussions |
| `sequence` | API flows, debugging sessions, step-by-step processes, authentication flows, request/response patterns |
| `knowledge_graph` | Architecture discussions, system components, entity relationships, technical stacks |
| `timeline` | Project history, milestones, version changes, chronological events |

**Default to `mindmap`** if unclear.

### Step 3: Generate JSON

Output the visualization JSON in a code block. Follow the exact schema for the chosen type.

---

## JSON Schemas

### Mindmap

```json
{
  "metadata": {
    "topic": "1-4 word topic",
    "contentType": "mindmap",
    "nodeCount": 15
  },
  "nodes": [
    {
      "id": "root",
      "data": {
        "label": "Root Label (1-4 words)",
        "type": "root",
        "summary": "2-3 sentence summary of the main topic."
      }
    },
    {
      "id": "cat1",
      "data": {
        "label": "Category Name",
        "type": "category",
        "summary": "Summary of this category branch."
      }
    },
    {
      "id": "leaf1",
      "data": {
        "label": "Specific Point",
        "type": "leaf",
        "summary": "Details about this specific point."
      }
    }
  ],
  "edges": [
    { "id": "e-root-cat1", "source": "root", "target": "cat1" },
    { "id": "e-cat1-leaf1", "source": "cat1", "target": "leaf1" }
  ],
  "hierarchy": {
    "root": ["cat1", "cat2", "cat3"],
    "cat1": ["leaf1", "leaf2"],
    "cat2": ["leaf3", "leaf4"]
  }
}
```

**Rules:**
- Labels: 1-4 words maximum
- Summaries: 2-3 sentences
- Structure: 1 root → 3-5 categories → 2-4 leaves per category
- Total nodes: 10-25
- Node types: `root`, `category`, `leaf`

---

### Sequence Diagram

```json
{
  "metadata": {
    "title": "Sequence Title",
    "summary": "2-3 sentence description of the flow."
  },
  "participants": [
    {
      "id": "user",
      "label": "User",
      "type": "Actor",
      "description": "End user interacting with the system"
    },
    {
      "id": "api",
      "label": "API Server",
      "type": "Participant",
      "description": "Backend REST API"
    },
    {
      "id": "db",
      "label": "Database",
      "type": "Participant",
      "description": "PostgreSQL database"
    }
  ],
  "activations": [
    { "participant": "api", "startStep": 2, "endStep": 5 }
  ],
  "fragments": [],
  "events": [
    {
      "step": 1,
      "type": "message",
      "source": "user",
      "target": "api",
      "label": "POST /login",
      "arrowType": "solid",
      "lineType": "solid"
    },
    {
      "step": 2,
      "type": "message",
      "source": "api",
      "target": "db",
      "label": "Query user",
      "arrowType": "solid",
      "lineType": "solid"
    },
    {
      "step": 3,
      "type": "message",
      "source": "db",
      "target": "api",
      "label": "User data",
      "arrowType": "open_arrow",
      "lineType": "dotted"
    },
    {
      "step": 4,
      "type": "message",
      "source": "api",
      "target": "user",
      "label": "JWT Token",
      "arrowType": "open_arrow",
      "lineType": "dotted"
    }
  ]
}
```

**Rules:**
- Participants: 2-6 (use `Actor` for humans, `Participant` for systems)
- Events: 5-15 steps
- Arrow types: `solid` (request/call), `open_arrow` (response/return)
- Line types: `solid` (synchronous), `dotted` (async/response)
- Steps must be sequential integers starting at 1

---

### Knowledge Graph

```json
{
  "metadata": {
    "projectName": "Project Name",
    "topic": "Main Topic",
    "contentType": "knowledge_graph"
  },
  "nodes": [
    {
      "id": "root",
      "data": {
        "label": "Central Concept",
        "type": "data",
        "summary": "Description of the central concept."
      }
    },
    {
      "id": "cat1",
      "data": {
        "label": "Category",
        "type": "backend",
        "summary": "Description of this category."
      }
    },
    {
      "id": "item1",
      "data": {
        "label": "Specific Item",
        "type": "frontend",
        "summary": "Details about this item.",
        "characteristics": ["char1", "char2"],
        "examples": ["example1"]
      }
    }
  ],
  "hierarchy": {
    "root": ["cat1", "cat2", "cat3"],
    "cat1": ["item1", "item2"],
    "cat2": ["item3", "item4"]
  },
  "edges": [
    { "id": "e-root-cat1", "source": "root", "target": "cat1", "type": "contains" },
    { "id": "e-cat1-item1", "source": "cat1", "target": "item1", "type": "contains" }
  ]
}
```

**Rules:**
- Strict 3-level hierarchy: Root → Categories → Items
- Node types by level:
  - Level 1 (Root): `data`
  - Level 2 (Categories): `backend`
  - Level 3 (Items): `frontend` or `utility`
- Edge types: `establishes`, `involves`, `connects`, `contains`, `relates`

---

### Timeline

```json
{
  "metadata": {
    "title": "Timeline Title",
    "summary": "Overview of the timeline.",
    "contentType": "timeline"
  },
  "events": [
    {
      "id": "event1",
      "date": "2024-01-15",
      "title": "First Event",
      "description": "What happened during this event.",
      "category": "Development"
    },
    {
      "id": "event2",
      "date": "2024-02-01",
      "title": "Second Event",
      "description": "Description of the next milestone.",
      "category": "Testing"
    }
  ]
}
```

**Rules:**
- Events in chronological order
- Dates: ISO format (YYYY-MM-DD) or relative ("Step 1", "Phase 1")
- Titles: 1-6 words
- Descriptions: 1-2 sentences
- Categories are optional

---

## Example Output

When asked to compact a debugging conversation:

```json
{
  "metadata": {
    "title": "API Authentication Debug",
    "summary": "Debugging session that identified and fixed a JWT token validation issue causing 401 errors on protected routes."
  },
  "participants": [
    { "id": "dev", "label": "Developer", "type": "Actor" },
    { "id": "api", "label": "API Server", "type": "Participant" },
    { "id": "auth", "label": "Auth Service", "type": "Participant" }
  ],
  "activations": [],
  "fragments": [],
  "events": [
    { "step": 1, "type": "message", "source": "dev", "target": "api", "label": "GET /protected", "arrowType": "solid", "lineType": "solid" },
    { "step": 2, "type": "message", "source": "api", "target": "auth", "label": "Validate JWT", "arrowType": "solid", "lineType": "solid" },
    { "step": 3, "type": "message", "source": "auth", "target": "api", "label": "Invalid: wrong secret", "arrowType": "open_arrow", "lineType": "dotted" },
    { "step": 4, "type": "message", "source": "api", "target": "dev", "label": "401 Unauthorized", "arrowType": "open_arrow", "lineType": "dotted" },
    { "step": 5, "type": "message", "source": "dev", "target": "api", "label": "Fix: update JWT_SECRET", "arrowType": "solid", "lineType": "solid" },
    { "step": 6, "type": "message", "source": "api", "target": "dev", "label": "200 OK", "arrowType": "open_arrow", "lineType": "dotted" }
  ]
}
```

---

## Response Format

When compacting, respond with:

1. Brief statement of chosen visualization type and why
2. The JSON in a fenced code block with `json` language tag
3. Optionally, instructions to save or use the visualization

Example response:
```
Based on our debugging session tracing the authentication flow, a **sequence diagram** best captures the request/response pattern we followed.

\`\`\`json
{ ... }
\`\`\`

You can paste this JSON into Navigate Chat or save it as a `.json` file.
```
