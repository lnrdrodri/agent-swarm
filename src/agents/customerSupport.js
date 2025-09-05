import {
  customerSupport,
  hasIssuesInAccount,
} from "../tools/customerSupport.js";
import { llm } from "../config/llm.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const customerSupportAgent = createReactAgent({
  llm,
  tools: [customerSupport, hasIssuesInAccount],
});
