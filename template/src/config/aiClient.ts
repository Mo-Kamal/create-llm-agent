import OpenAI from "openai";
import { DEFAULT_BASE_URL } from "../constants";

export const openAiClient = new OpenAI({
  apiKey: process.env.LLM_API_KEY || "default value", // required param, value doesn't matter if using local LLM
  baseURL: process.env.LLM_BASE_URL
    ? process.env.LLM_BASE_URL
    : DEFAULT_BASE_URL, // default OpenAI API URL
});
