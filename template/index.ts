import "dotenv/config";
import * as readline from "readline";
import { runAgent } from "./src/agent/index.js";
import { tools } from "./src/tools/index.js";
import { STYLES } from "./src/ui/styles.js";

// CLI chat loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${STYLES.user("You")} ${STYLES.dim(">")} `,
});

// Welcome message with styled banner
console.log(STYLES.border("┌─────────────────────────────────────────┐"));
console.log(
  STYLES.border("│") +
    STYLES.highlight("  💬 Local LLM Chat Interface  ") +
    STYLES.border("        │")
);
console.log(STYLES.border("├─────────────────────────────────────────┤"));
console.log(
  STYLES.border("│") +
    STYLES.dim("  Available tools:                      ") +
    STYLES.border("│")
);
console.log(
  STYLES.border("│") +
    STYLES.success("  • generate_dad_joke                   ") +
    STYLES.border("│")
);
console.log(
  STYLES.border("│") +
    STYLES.success("  • generate_animal_name                ") +
    STYLES.border("│")
);
console.log(STYLES.border("├─────────────────────────────────────────┤"));
console.log(
  STYLES.border("│") +
    STYLES.dim(`  Type "exit" to quit                    `) +
    STYLES.border("│")
);
console.log(STYLES.border("└─────────────────────────────────────────┘"));
console.log(); // Empty line for spacing

rl.prompt();

rl.on("line", async (line) => {
  const userMessage = line.trim();

  if (userMessage.toLowerCase() === "exit") {
    console.log();
    console.log(STYLES.system("👋 Thanks for chatting! Goodbye!"));
    console.log();
    rl.close();
    process.exit(0);
  }

  if (!userMessage) {
    rl.prompt();
    return;
  }

  // Empty logs are for spacing
  try {
    console.log();

    const response = await runAgent({ userMessage, tools: tools });

    // Get the last message (assistant reply)
    const last = response[response.length - 1];

    // Format the AI response with proper styling
    const content =
      typeof last.content === "string"
        ? last.content
        : Array.isArray(last.content)
        ? last.content.map((part) => ("text" in part ? part.text : "")).join("")
        : "";
    console.log(
      STYLES.ai("AI") + STYLES.dim(" > ") + STYLES.highlight(content)
    );
  } catch (err) {
    console.log();
    console.log(
      STYLES.error("⚠️  Error:"),
      STYLES.error(err instanceof Error ? err.message : String(err))
    );

    // Show helpful error message
    if (err instanceof Error && err.message.includes("fetch")) {
      console.log(
        STYLES.dim(
          "   💡 Tip: Check your internet connection or API configuration"
        )
      );
    }
  }

  console.log();
  rl.prompt();
});

// Handle Ctrl+C gracefully
rl.on("SIGINT", () => {
  console.log();
  console.log();
  console.log(STYLES.system("👋 Chat interrupted. Goodbye!"));
  process.exit(0);
});

// Enhanced error handling
process.on("uncaughtException", (error) => {
  console.log();
  console.log(STYLES.error("💥 Unexpected error:"), error.message);
  console.log(STYLES.dim("   Please restart the application"));
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.log();
  console.log(STYLES.error("💥 Unhandled promise rejection:"), reason);
  console.log(STYLES.dim("   Please restart the application"));
  process.exit(1);
});
