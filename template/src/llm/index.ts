import { zodFunction } from "openai/helpers/zod";
import { systemPrompt } from "../config/systemPrompt.js";
import { openAiClient } from "../config/aiClient.js";
import { Role, type AIMessage } from "../types/index.js";
import { DEFAULT_LLM_MODEL } from "../constants/index.js";

export const runLLM = async ({
  messages,
  tools,
}: {
  messages: AIMessage[];
  tools: any[];
}) => {
  const formattedTools = tools.map(zodFunction);

  const toolRelatedConfigs = {
    tools: formattedTools,
    tool_choice: "auto",
    parallel_tool_calls: false,
  };
  const response = await openAiClient.chat.completions.create({
    model: process.env.LLM_MODEL || DEFAULT_LLM_MODEL,
    temperature: 0.1,
    messages: [{ role: Role.SYSTEM, content: systemPrompt }, ...messages],
    max_tokens: 500,
    ...(process.env.LLM_TOOL_CALLING && formattedTools?.length > 0
      ? toolRelatedConfigs
      : {}),
  });

  return response.choices[0]?.message;
};
