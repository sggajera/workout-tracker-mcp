import type { WorkoutRow } from "./types";


declare global {
    interface Window {
      openai?: {
        toolOutput?: OpenAIToolOutput;
        callTool?: (
          name: string,
          args: Record<string, unknown>
        ) => Promise<{
          structuredContent?: OpenAIToolOutput;
        }>;
      };
    }
  }
  
  export {};