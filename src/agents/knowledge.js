import { ragRetrieve } from "../tools/ragRetrieve.js";
import { llm } from "../config/llm.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const knowledgeAgent = createReactAgent({
  llm,
  tools: [ragRetrieve],
});
