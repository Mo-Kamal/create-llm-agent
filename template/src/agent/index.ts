import { runLLM } from "../llm/index.js";
import { addMessages, getMessages, saveToolResponse } from "../memory/index.js";
import { runTool } from "../tools/toolRunner.js";
import { Role } from "../types/index.js";
import { showLoader } from "../ui/index.js";

export const runAgent = async ({
  userMessage,
  tools,
}: {
  userMessage: string;
  tools: any[];
}) => {
  await addMessages([{ role: Role.USER, content: userMessage }]);

  const loader = showLoader("🤔 Thinking...");

  while (true) {
    const history = await getMessages();
    const response = await runLLM({ messages: history, tools });

    await addMessages([response]);

    if (response.content) {
      loader.stop();
      return getMessages();
    }

    // Check for tool calls
    if (response.tool_calls) {
      const toolCall = response.tool_calls[0];
      console.log("Tool called...");

      // Check if the function name is empty or missing
      if (!toolCall?.function?.name) {
        console.warn("Tool call missing function name, skipping...");

        // Add a message indicating the issue and continue
        await addMessages([
          {
            role: Role.ASSISTANT,
            content:
              "I tried to use a tool but encountered an error. Let me respond directly instead.",
          },
        ]);

        // Retry without tools or provide a fallback response
        const fallbackResponse = await runLLM({
          messages: await getMessages(),
          tools: [],
        });
        console.log("fallback", fallbackResponse);
        await addMessages([fallbackResponse]);

        if (fallbackResponse.content) {
          loader.stop();
          return getMessages();
        }

        continue;
      }

      loader.update(`executing: ${toolCall?.function?.name}`);

      try {
        const toolResponse = await runTool(toolCall, userMessage);
        await saveToolResponse(toolCall.id, toolResponse);
        loader.update(`done: ${toolCall?.function?.name}`);
      } catch (error) {
        console.error("Tool execution error:", error);
        loader.update("tool execution failed");

        // Add error message and continue
        await addMessages([
          {
            role: Role.TOOL,
            tool_call_id: toolCall.id,
            content: "Tool execution failed",
          },
        ]);
      }
    }
  }
};
