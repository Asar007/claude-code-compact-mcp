import type { VisualizationData, ToolResult } from '../types/index.js';
import { NavigateApiClient } from '../services/navigate-api-client.js';

export interface PushToNavigateInput {
  /** Visualization data to push */
  visualization: VisualizationData;
  /** Optional metadata for the thread */
  metadata?: Record<string, unknown>;
}

export interface PushToNavigateOutput {
  threadId: string;
  threadUrl: string;
  success: boolean;
}

/**
 * Push to Navigate tool - pushes visualization to Navigate Chat API
 */
export async function pushToNavigate(
  input: PushToNavigateInput
): Promise<ToolResult<PushToNavigateOutput>> {
  // Get config from environment
  const baseUrl = process.env.NAVIGATE_CHAT_API_URL;
  const email = process.env.NAVIGATE_CHAT_EMAIL;
  const password = process.env.NAVIGATE_CHAT_PASSWORD;

  if (!baseUrl || !email || !password) {
    return {
      success: false,
      error: 'Missing Navigate Chat API configuration. Set NAVIGATE_CHAT_API_URL, NAVIGATE_CHAT_EMAIL, and NAVIGATE_CHAT_PASSWORD environment variables.',
    };
  }

  const client = new NavigateApiClient({ baseUrl, email, password });

  try {
    const result = await client.pushVisualization(input.visualization, input.metadata);

    // Construct thread URL
    const baseUrlClean = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const threadUrl = `${baseUrlClean}/chat/${result.threadId}`;

    return {
      success: true,
      data: {
        threadId: result.threadId,
        threadUrl,
        success: result.success,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to push to Navigate Chat: ${message}`,
    };
  }
}

/**
 * Test Navigate Chat API connection
 */
export async function testNavigateConnection(): Promise<ToolResult<{ authenticated: boolean }>> {
  const baseUrl = process.env.NAVIGATE_CHAT_API_URL;
  const email = process.env.NAVIGATE_CHAT_EMAIL;
  const password = process.env.NAVIGATE_CHAT_PASSWORD;

  if (!baseUrl || !email || !password) {
    return {
      success: false,
      error: 'Missing Navigate Chat API configuration',
    };
  }

  const client = new NavigateApiClient({ baseUrl, email, password });

  try {
    await client.authenticate();
    return {
      success: true,
      data: { authenticated: true },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Authentication failed: ${message}`,
    };
  }
}
