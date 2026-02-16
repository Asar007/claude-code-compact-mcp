#!/usr/bin/env node
/**
 * Claude Code Compact MCP Server
 *
 * An MCP server that compacts Claude Code conversations into
 * Navigate Chat-compatible visualization JSON files.
 */

import 'dotenv/config';
import { startServer } from './server.js';

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
