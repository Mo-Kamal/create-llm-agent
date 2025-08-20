import OpenAI from "openai";

export type AIMessage =
  | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
  | { role: "user"; content: string }
  | { role: "tool"; content: string; tool_call_id: string };

export interface ToolFn<A = any, T = any> {
  (input: { userMessage: string; toolArgs: A }): Promise<T>;
}

export type MessageWithMetadata = AIMessage & {
  id: string;
  createdAt: string;
};

export type Data = {
  messages: MessageWithMetadata[];
};

export const Role = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
  TOOL: "ipython",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
