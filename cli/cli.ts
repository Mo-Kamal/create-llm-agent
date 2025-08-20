#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import { program } from "commander";
import { ASSISTANT_MODES, getSystemPrompt } from "./constants.js";

// Resolve __dirname in ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ASCII Art Banner
const banner = `
${chalk.cyan("╔═══════════════════════════════════╗")}
${chalk.cyan("║")}  🤖 ${chalk.bold("Create LLM Agent")}           ${chalk.cyan(
  "║"
)}
${chalk.cyan("║")}  Build AI-powered chat agents    ${chalk.cyan("║")}
${chalk.cyan("╚═══════════════════════════════════╝")}
`;

interface ProjectConfig {
  projectName: string;
  llmModel: string;
  llmApiKey: string;
  llmBaseUrl: string;
  llmToolCalling: boolean;
}

// Validate project name
const validateProjectName = (name: string): boolean => {
  const pattern = /^[a-z0-9-_]+$/;
  return pattern.test(name);
};

// Get package manager
const getPackageManager = (): string => {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.includes("yarn")) return "yarn";
  if (userAgent.includes("pnpm")) return "pnpm";
  return "npm";
};

// Main CLI function
const createProject = async () => {
  console.clear();
  console.log(banner);
  console.log();

  // Parse command line arguments
  program
    .argument("[project-name]", "Name of your project")
    .parse(process.argv);

  const args = program.args;
  let projectName = args[0];

  // Step 1: Get project name if not provided
  if (!projectName) {
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is your project name?",
        default: "my-llm-agent",
        validate: (input) => {
          if (!validateProjectName(input)) {
            return "Project name can only contain lowercase letters, numbers, hyphens, and underscores";
          }
          return true;
        },
      },
    ]);
    projectName = name;
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory ${chalk.yellow(
          projectName
        )} already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.red("✖ Operation cancelled"));
      process.exit(0);
    }

    const spinner = ora("Removing existing directory...").start();
    await fs.remove(targetDir);
    spinner.succeed("Existing directory removed");
  }

  // Step 2: LLM Configuration
  console.log();
  console.log(chalk.bold("📋 LLM Configuration"));
  console.log(chalk.gray("Configure your Large Language Model settings"));
  console.log();

  // LLM Configuration - Simplified
  const llmAnswers = await inquirer.prompt([
    {
      type: "input",
      name: "llmModel",
      message: "Enter the model name (e.g., gpt-4o-mini, claude-3-haiku):",
      default: "gpt-4o-mini",
      validate: (input) => input.length > 0 || "Model name is required",
    },
    {
      type: "input",
      name: "llmBaseUrl",
      message: "Enter your LLM API base URL:",
      default: "https://api.openai.com/v1",
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return "Please enter a valid URL";
        }
      },
    },
    {
      type: "password",
      name: "llmApiKey",
      message: "Enter your API key (press Enter to skip if using local model):",
      default: "",
    },
  ]);

  // Ask if user wants to use tools
  const { llmToolCalling } = await inquirer.prompt([
    {
      type: "confirm",
      name: "llmToolCalling",
      message:
        "Do you want to use tools? (make sure your model supports tool calling)",
      default: false,
    },
  ]);

  // System Prompt Selection
  const { promptChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "promptChoice",
      message: "Select a system prompt for your agent:",
      choices: [
        {
          name: "🤖 General Assistant - A helpful, general-purpose AI assistant",
          value: "general",
        },
        {
          name: "💻 Code Assistant - Specialized in programming and technical help",
          value: "coding",
        },
        {
          name: "✏️ Custom - Enter your own system prompt",
          value: "custom",
        },
      ],
      default: "general",
    },
  ]);

  let systemPromptContent = "";

  if (promptChoice === "custom") {
    const { customPrompt } = await inquirer.prompt([
      {
        type: "editor",
        name: "customPrompt",
        message:
          "Enter your custom system prompt (press Enter to open editor):",
        default: "You are a helpful AI assistant.",
        validate: (input) =>
          input.length > 0 || "System prompt cannot be empty",
      },
    ]);
    systemPromptContent = customPrompt;
  } else if (promptChoice === "coding") {
    systemPromptContent = getSystemPrompt(ASSISTANT_MODES.CODING);
  } else {
    systemPromptContent = getSystemPrompt(ASSISTANT_MODES.GENERAL);
  }

  let config: ProjectConfig = {
    projectName,
    llmModel: llmAnswers.llmModel,
    llmApiKey: llmAnswers.llmApiKey,
    llmBaseUrl: llmAnswers.llmBaseUrl,
    llmToolCalling: llmToolCalling,
  };

  console.log();
  console.log(chalk.bold("🚀 Creating your project..."));
  console.log();

  // Step 4: Copy template files
  const spinner = ora("Copying template files...").start();
  try {
    const templateDir = path.resolve(__dirname, "../template");

    // Create target directory
    await fs.ensureDir(targetDir);

    // Copy all template files
    await fs.copy(templateDir, targetDir, {
      filter: (src) => {
        const basename = path.basename(src);
        // Skip node_modules and other build artifacts
        return !["node_modules", "dist", ".env"].includes(basename);
      },
    });

    spinner.succeed("Template files copied");
  } catch (error) {
    spinner.fail("Failed to copy template files");
    console.error(error);
    process.exit(1);
  }

  // Step 5: Create .env file
  const envSpinner = ora("Creating environment configuration...").start();
  try {
    const envContent = `# LLM Configuration
LLM_MODEL=${config.llmModel}
LLM_API_KEY=${config.llmApiKey}
LLM_BASE_URL=${config.llmBaseUrl}
LLM_TOOL_CALLING=${config.llmToolCalling}
`;

    await fs.writeFile(path.join(targetDir, ".env"), envContent);
    envSpinner.succeed("Environment configuration created");
  } catch (error) {
    envSpinner.fail("Failed to create .env file");
    console.error(error);
    process.exit(1);
  }

  // Step 5.1: Create/Update systemPrompt.ts with user's choice
  const promptSpinner = ora("Configuring system prompt...").start();
  try {
    const systemPromptPath = path.join(
      targetDir,
      "src",
      "config",
      "systemPrompt.ts"
    );
    const systemPromptFile = `export const systemPrompt = \`${systemPromptContent}\`;
`;

    await fs.writeFile(systemPromptPath, systemPromptFile);
    promptSpinner.succeed("System prompt configured");
  } catch (error) {
    promptSpinner.fail("Failed to configure system prompt");
    console.error(error);
  }

  // Step 6: Update package.json with project name
  const pkgSpinner = ora("Updating package.json...").start();
  try {
    const pkgPath = path.join(targetDir, "package.json");
    const pkg = await fs.readJSON(pkgPath);
    pkg.name = projectName;
    await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
    pkgSpinner.succeed("package.json updated");
  } catch (error) {
    pkgSpinner.fail("Failed to update package.json");
    console.error(error);
  }

  // Step 8: Install dependencies
  const packageManager = getPackageManager();
  console.log();
  console.log(
    chalk.bold(`📦 Installing dependencies with ${packageManager}...`)
  );
  console.log(chalk.gray("This might take a while..."));
  console.log();

  const installSpinner = ora("Installing packages...").start();
  try {
    execSync(`${packageManager} install`, {
      cwd: targetDir,
      stdio: "ignore",
    });
    installSpinner.succeed("Dependencies installed");
  } catch (error) {
    installSpinner.warn("Failed to install dependencies automatically");
    console.log(chalk.yellow("Please run npm install manually"));
  }

  // Step 9: Show success message
  console.log();
  console.log(
    chalk.green.bold("✨ Success!") + " Your LLM Agent project is ready."
  );
  console.log();
  console.log(chalk.bold("📁 Project created at:"));
  console.log(`   ${chalk.cyan(targetDir)}`);
  console.log();
  console.log(chalk.bold("🚀 To get started:"));
  console.log();
  console.log(chalk.gray("   # Navigate to project"));
  console.log(`   ${chalk.cyan(`cd ${projectName}`)}`);
  console.log();

  if (!config.llmApiKey) {
    console.log(chalk.gray("   # Make sure your local LLM server is running"));
    console.log(`   ${chalk.cyan("ollama serve")}`);
    console.log();
    console.log(chalk.gray("   # Pull the model (if not already available)"));
    console.log(`   ${chalk.cyan(`ollama pull ${config.llmModel}`)}`);
    console.log();
  }

  console.log(chalk.gray("   # Start the development server"));
  console.log(`   ${chalk.cyan("npm run dev")}`);
  console.log();
  console.log(chalk.bold("📚 Available commands:"));
  console.log();
  console.log(`   ${chalk.cyan("npm run dev")}     - Start chat interface`);
  console.log(
    `   ${chalk.cyan("npm run clear")}   - Clear conversation history`
  );
  console.log(`   ${chalk.cyan("npm run build")}   - Build for production`);
  console.log();
  console.log(chalk.bold("📖 Documentation:"));
  console.log(
    `   ${chalk.cyan("https://github.com/Mo-Kamal/create-llm-agent")}`
  );
  console.log();
  console.log(chalk.magenta("Let's Start! 🎉"));
};

// Error handling
process.on("unhandledRejection", (err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});

// Run the CLI
createProject().catch((err) => {
  console.error(chalk.red("Unexpected error:"), err);
  process.exit(1);
});
