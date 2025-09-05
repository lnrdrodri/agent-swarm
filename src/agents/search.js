import { web_search } from "../tools/webSearch.js";
import { llm } from "../config/llm.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const searchAgent = createReactAgent({
  llm,
  tools: [web_search],
});
