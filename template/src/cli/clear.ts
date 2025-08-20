import { clearMessages } from "../memory";

const run = async () => {
  await clearMessages();
  console.log("🗑️ db.json memory cleared!");
};

run();
