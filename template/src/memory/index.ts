import { JSONFilePreset } from "lowdb/node";
import type { Low } from "lowdb";
import { v4 as uuid } from "uuid";
import type { AIMessage, Data, MessageWithMetadata } from "../types";
import { writeFile } from "fs";

const DB_FILE = "db.json";
const emptyData = { messages: [] };
export const addMetadata = (message: AIMessage) => {
  return {
    ...message,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
};

export const removeMetadata = (message: MessageWithMetadata) => {
  const { id, createdAt, ...rest } = message;
  return rest;
};

const defaultData: Data = {
  messages: [],
};

export const getDb = async () => {
  const db = await JSONFilePreset<Data>(DB_FILE, defaultData);
  return db;
};

export const addMessages = async (messages: AIMessage[]) => {
  const db = await getDb();
  db.data.messages.push(...messages.map(addMetadata));
  await db.write();
};

export const getMessages = async () => {
  const db = await getDb();
  return db.data.messages.map(removeMetadata);
};

export const clearMessages = async () => {
  await new Promise<void>((resolve, reject) => {
    writeFile(DB_FILE, JSON.stringify(emptyData, null, 2), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const saveToolResponse = async (
  toolCallId: string,
  toolResponse: string
) => {
  return addMessages([
    {
      role: "tool",
      content: toolResponse,
      tool_call_id: toolCallId,
    },
  ]);
};
