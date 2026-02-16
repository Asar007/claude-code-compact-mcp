import type { VisualizationData, VisualizationType, ToolResult } from '../types/index.js';
import { FileService } from '../services/file-service.js';

export interface ExportJsonInput {
  /** Visualization data to export */
  visualization: VisualizationData;
  /** Type of visualization */
  type: VisualizationType;
  /** Optional custom filename */
  filename?: string;
  /** Optional custom output directory */
  outputDir?: string;
}

export interface ExportJsonOutput {
  filePath: string;
  filename: string;
  type: VisualizationType;
}

/**
 * Export JSON tool - saves visualization to local file
 */
export async function exportJson(
  input: ExportJsonInput
): Promise<ToolResult<ExportJsonOutput>> {
  const fileService = new FileService(input.outputDir);

  try {
    const filePath = await fileService.exportVisualization(
      input.visualization,
      input.type,
      input.filename
    );

    const filename = filePath.split(/[/\\]/).pop() || '';

    return {
      success: true,
      data: {
        filePath,
        filename,
        type: input.type,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to export JSON: ${message}`,
    };
  }
}

/**
 * List exported visualizations
 */
export async function listExportedVisualizations(
  outputDir?: string
): Promise<ToolResult<string[]>> {
  const fileService = new FileService(outputDir);

  try {
    const files = await fileService.listVisualizations();
    return {
      success: true,
      data: files,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to list visualizations: ${message}`,
    };
  }
}
