import { llm } from "../config/llm.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const personalityAgent = createReactAgent({
  llm,
  tools: [],
});
