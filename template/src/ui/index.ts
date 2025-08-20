import { STYLES } from "./styles";

export const showLoader = (text: string) => {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let index = 0;
  let isRunning = true;
  let currentText = text;

  const interval = setInterval(() => {
    if (isRunning) {
      const spinner = STYLES.spinner(frames[index]);
      const styledText = STYLES.default(currentText);

      process.stdout.write(`\r${spinner} ${styledText}`);
      index = (index + 1) % frames.length;
    }
  }, 100);

  return {
    stop: () => {
      isRunning = false;
      clearInterval(interval);
      process.stdout.write("\r" + " ".repeat(50) + "\r"); // Clear the spinner line
    },
    update: (newText: string) => {
      currentText = newText;
    },
  };
};
