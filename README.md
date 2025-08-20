# create-llm-agent

> Quickly scaffold a TypeScript-based LLM agent application with local or remote AI models

[![npm version](https://img.shields.io/npm/v/create-llm-agent.svg)](https://www.npmjs.com/package/create-llm-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

Create a new LLM agent project with a single command:

```bash
npx create-llm-agent my-agent
```

Or using yarn:

```bash
yarn create-llm-agent my-agent
```

## 🎯 Features

- **OpenAI Compatible**: Support for OpenAI and any OpenAI-compatible API providers (Even local models)
- **TypeScript**: Full TypeScript support out of the box
- **Local Database**: JSON-based local storage for conversations and memory
- **Configurable Tools**: Optional tool/function calling system that can be enabled or disabled
- **System Prompt Options**: Choose from General Assistant, Code Assistant, or create custom prompts
- **Interactive CLI**: Beautiful command-line interface for chatting with your agent
- **Zero Config**: Works out of the box with sensible defaults
- **Modular Architecture**: Clean, organized code structure

## 📋 Requirements

- Node.js 20.0 or higher
- npm, yarn, or pnpm
- For local models: [Ollama](https://ollama.ai) installed and running

## 🛠️ Installation & Usage

### Interactive Mode (Recommended)

Simply run the create command and follow the prompts:

```bash
npx create-llm-agent
```

You'll be asked to:

1. Choose a project name
2. Configure your LLM settings (model, API key, base URL)
3. Enable or disable tool calling
4. Select a system prompt (General, Coding, or Custom)

### Quick Mode

Provide the project name directly:

```bash
npx create-llm-agent my-agent
```

## 🏗️ Project Structure

Your generated project will have the following structure:

```
my-agent/
├── src/
│   ├── agent/          # Agent logic and orchestration
│   ├── cli/            # CLI utilities
│   ├── config/         # Configuration and system prompts
│   ├── constants/      # Application constants
│   ├── llm/            # LLM client implementations
│   ├── memory/         # Memory and storage management
│   ├── tools/          # Tool definitions and runner
│   ├── types/          # TypeScript type definitions
│   ├── ui/             # User interface components
│   └── index.ts        # Main entry point
├── db.json             # Local JSON database
├── .env               # Environment configuration
├── package.json
└── tsconfig.json
```

## 🎮 Available Scripts

Once your project is created, you can use these commands:

- `npm run dev` - Start the chat interface in development mode
- `npm run build` - Build the project for production
- `npm start` - Run the production build
- `npm run clear` - Clear conversation history

## 🔧 Configuration

### Environment Variables

The `.env` file contains your LLM configuration:

```env
# LLM Configuration
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=sk-your-api-key-here
LLM_BASE_URL=https://api.openai.com/v1
LLM_TOOL_CALLING=true
```

### Supported Configurations

#### OpenAI

```env
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=sk-your-api-key-here
LLM_BASE_URL=https://api.openai.com/v1
LLM_TOOL_CALLING=true
```

#### Local Model (Llama 3.1 with Ollama)

```env
LLM_MODEL=llama3.1:8b
LLM_API_KEY=
LLM_BASE_URL=http://localhost:11434/v1
LLM_TOOL_CALLING=false
```

## 📚 Examples

### Basic Chat

After creating your project:

```bash
cd my-agent
npm run dev
```

Then interact with your agent through the CLI interface.

### Adding Custom Tools

Create new tools in `src/tools/` to extend your agent's capabilities:

```typescript
import { z } from "zod";
import { ToolFn } from "../types";

export const weatherToolDefinition = {
  name: "get_weather",
  parameters: z.object({
    location: z.string().describe("The city name"),
  }),
  description: "Get current weather information for a location",
};

type Args = z.infer<typeof weatherToolDefinition.parameters>;

export const getWeather: ToolFn<Args, string> = async ({
  toolArgs,
  userMessage,
}) => {
  // Implementation here
  return `The weather in ${toolArgs.location} is sunny and 22°C`;
};
```

### Custom System Prompts

Modify `src/config/systemPrompt.ts` to customize your agent's behavior:

```typescript
export const systemPrompt = `
You are a helpful AI assistant specialized in...
Your key capabilities include...
`;
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [OpenAI SDK](https://github.com/openai/openai-node)
- CLI interface using [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

## 📧 Support

For issues and questions, please [open an issue](https://github.com/Mo-Kamal/create-llm-agent/issues) on GitHub.
