'use server';

import { ConsoleCapture } from './console-capture';

/**
 * Wrapper for server actions that need to capture console output
 * Specifically designed for MCP discovery process
 */
export async function withConsoleCapture<T extends any[], R>(
  serverAction: (...args: T) => Promise<R>
): Promise<(...args: T) => Promise<{ result: R; logs: string[] }>> {
  return async (...args: T) => {
    const capture = new ConsoleCapture();
    
    try {
      // Start capturing console output
      capture.start();
      
      // Execute the server action
      const result = await serverAction(...args);
      
      // Stop capturing and get logs
      const logs = capture.stop();
      
      // Return both the result and captured logs
      return {
        result,
        logs,
      };
    } catch (error) {
      // Make sure to stop capturing on error and get logs
      const logs = capture.stop();
      
      // Re-throw with logs attached
      if (error instanceof Error) {
        (error as any).capturedLogs = logs;
      }
      throw error;
    }
  };
}

/**
 * Example usage with a discovery server action
 */
export async function discoverWithLogs(
  serverUuid: string,
  options?: { timeout?: number }
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  logs: string[];
}> {
  const { result, output } = await ConsoleCapture.captureAsync(async () => {
    // This is where you would call your actual discovery logic
    // For now, this is a placeholder that demonstrates the pattern
    
    
    if (options?.timeout) {
    }
    
    try {
      // Simulate discovery process with various log levels
      console.info('Connecting to MCP server...');
      console.debug('Debug: Checking server configuration');
      
      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.info('Fetching available tools...');
      
      // Simulate more work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      
      return {
        success: true,
        data: {
          tools: ['tool1', 'tool2'],
          resources: ['resource1'],
          prompts: [],
        },
      };
    } catch (error) {
      console.error('Discovery failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
  
  return {
    success: result?.success ?? false,
    data: result?.data,
    error: result?.error,
    logs: output,
  };
}

/**
 * Utility to create a discovery action with automatic console capture
 */
export function createDiscoveryAction<T extends any[], R>(
  discoveryFn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<{ result: R; logs: string[] }> => {
    const { result, output } = await ConsoleCapture.captureAsync(() => discoveryFn(...args));
    return { 
      result: result as R, 
      logs: output 
    };
  };
}