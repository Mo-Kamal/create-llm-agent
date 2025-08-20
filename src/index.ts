// index.ts
import "dotenv/config";
import readline from "readline";
import { runAgent } from "./agent/agent";
import { z } from "zod";

// Example tool
const weatherTool = {
  name: "get_stuff",
  description: `use this to get the weather`,
  parameters: z.object({
    reasoning: z.string().describe("why did you pick this tool?"),
  }),
};

// CLI chat loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You (User) > ",
});

console.log('💬 Local LLM Chat started! (type "exit" to quit)');
rl.prompt();

rl.on("line", async (line) => {
  const userMessage = line.trim();

  if (userMessage.toLowerCase() === "exit") {
    console.log("👋 Exiting chat. Goodbye!");
    rl.close();
    process.exit(0);
  }

  try {
    const response = await runAgent({ userMessage, tools: [weatherTool] });

    // last message is assistant reply
    const last = response[response.length - 1];
    console.log(`AI (Assistant) > ${last.content}`);
  } catch (err) {
    console.error("⚠️ Error:", err);
  }

  rl.prompt();
});
