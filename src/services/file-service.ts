import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { VisualizationData, VisualizationType } from '../types/index.js';

export class FileService {
  private outputDir: string;

  constructor(outputDir?: string) {
    this.outputDir = outputDir || this.getDefaultOutputDir();
  }

  /**
   * Get default output directory
   */
  private getDefaultOutputDir(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, '.claude-code-compact', 'visualizations');
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * Generate filename for visualization
   */
  generateFilename(type: VisualizationType, topic?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTopic = topic
      ? topic.slice(0, 30).replace(/[^a-zA-Z0-9-_]/g, '_')
      : 'visualization';
    return `${type}_${sanitizedTopic}_${timestamp}.json`;
  }

  /**
   * Export visualization to JSON file
   */
  async exportVisualization(
    data: VisualizationData,
    type: VisualizationType,
    filename?: string
  ): Promise<string> {
    await this.ensureOutputDir();

    const topic = this.extractTopic(data);
    const finalFilename = filename || this.generateFilename(type, topic);
    const filePath = path.join(this.outputDir, finalFilename);

    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');

    return filePath;
  }

  /**
   * Read conversation from JSONL transcript file
   */
  async readTranscript(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  }

  /**
   * List available transcripts in Claude projects directory
   */
  async listTranscripts(): Promise<string[]> {
    const homeDir = os.homedir();
    const claudeProjectsDir = path.join(homeDir, '.claude', 'projects');

    try {
      const files: string[] = [];
      await this.findJsonlFiles(claudeProjectsDir, files);
      return files;
    } catch {
      return [];
    }
  }

  /**
   * Recursively find JSONL files
   */
  private async findJsonlFiles(dir: string, files: string[]): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await this.findJsonlFiles(fullPath, files);
        } else if (entry.name.endsWith('.jsonl')) {
          files.push(fullPath);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  /**
   * Extract topic from visualization data
   */
  private extractTopic(data: VisualizationData): string | undefined {
    const metadata = data.metadata as unknown as Record<string, unknown>;
    if (metadata) {
      if (typeof metadata.topic === 'string') {
        return metadata.topic;
      }
      if (typeof metadata.title === 'string') {
        return metadata.title;
      }
      if (typeof metadata.projectName === 'string') {
        return metadata.projectName;
      }
    }
    return undefined;
  }

  /**
   * Read visualization from JSON file
   */
  async readVisualization(filePath: string): Promise<VisualizationData> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as VisualizationData;
  }

  /**
   * List exported visualizations
   */
  async listVisualizations(): Promise<string[]> {
    try {
      await this.ensureOutputDir();
      const files = await fs.readdir(this.outputDir);
      return files
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(this.outputDir, f));
    } catch {
      return [];
    }
  }
}
