import { z } from "zod";
import type { ToolFn } from "../types";

export const generateDadJokeToolDefinition = {
  name: "generate_dad_joke",
  parameters: z.object({}),
  description: "generate a dad joke",
};

type Args = z.infer<typeof generateDadJokeToolDefinition.parameters>;

export const generateDadJoke: ToolFn<Args, string> = async ({ toolArgs }) => {
  const res = await fetch("https://icanhazdadjoke.com/", {
    headers: {
      Accept: "application/json",
    },
  });

  return (await res.json()).joke;
};
