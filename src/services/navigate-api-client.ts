import type {
  NavigateApiConfig,
  AuthToken,
  Thread,
  ThreadCreate,
  RunCreate,
  VisualizationData,
} from '../types/index.js';

interface SSEEvent {
  event: string;
  data: string;
}

export class NavigateApiClient {
  private config: NavigateApiConfig;
  private token: AuthToken | null = null;
  private tokenExpiry: number = 0;

  constructor(config: NavigateApiConfig) {
    this.config = config;
  }

  /**
   * Authenticate and get JWT token
   */
  async authenticate(): Promise<AuthToken> {
    // Check if we have a valid cached token
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const formData = new URLSearchParams();
    formData.append('username', this.config.email);
    formData.append('password', this.config.password);

    const response = await fetch(`${this.config.baseUrl}/api/users/login/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Authentication failed: ${response.status} ${error}`);
    }

    this.token = await response.json() as AuthToken;
    // Set expiry to 55 minutes (assuming 1 hour token validity)
    this.tokenExpiry = Date.now() + 55 * 60 * 1000;

    return this.token;
  }

  /**
   * Create a new thread
   */
  async createThread(data: ThreadCreate): Promise<Thread> {
    const token = await this.authenticate();

    const response = await fetch(`${this.config.baseUrl}/api/chat/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create thread: ${response.status} ${error}`);
    }

    return await response.json() as Thread;
  }

  /**
   * Stream a run with visualization data
   */
  async streamRun(
    threadId: string,
    visualizationData: VisualizationData,
    onEvent?: (event: SSEEvent) => void
  ): Promise<void> {
    const token = await this.authenticate();

    const runData: RunCreate = {
      input: {
        messages: [{
          type: 'human',
          content: JSON.stringify(visualizationData),
        }],
      },
      stream: true,
      stream_mode: ['values', 'messages'],
    };

    const response = await fetch(
      `${this.config.baseUrl}/api/threads/${threadId}/runs/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(runData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to stream run: ${response.status} ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body for SSE stream');
    }

    // Process SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:') && currentEvent) {
            const data = line.slice(5).trim();
            if (onEvent) {
              onEvent({ event: currentEvent, data });
            }
            if (currentEvent === 'end') {
              return;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Push visualization to Navigate Chat (create thread + stream)
   */
  async pushVisualization(
    visualizationData: VisualizationData,
    metadata?: Record<string, unknown>
  ): Promise<{ threadId: string; success: boolean }> {
    // Create thread
    const thread = await this.createThread({
      graph_id: 'agent',
      metadata: {
        source: 'claude-code-compact',
        ...metadata,
      },
    });

    // Stream the visualization
    const events: SSEEvent[] = [];
    await this.streamRun(thread.thread_id, visualizationData, (event) => {
      events.push(event);
    });

    return {
      threadId: thread.thread_id,
      success: events.some((e) => e.event === 'end'),
    };
  }
}
