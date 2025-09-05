import {
  StateGraph,
  END,
  MessagesAnnotation,
  MemorySaver,
  START,
  Annotation,
} from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import { llm } from "../config/llm.js";

import { knowledgeAgent } from "./knowledge.js";
import { customerSupportAgent } from "./customerSupport.js";
import { searchAgent } from "./search.js";
import { personalityAgent } from "./personality.js";

import { routerPrompt } from "../prompts/router.js";
import { personalityPrompt } from "../prompts/personality.js";
import { searchPrompt } from "../prompts/search.js";
import { supportPrompt } from "../prompts/support.js";
import { knowledgePrompt } from "../prompts/knowledge.js";

const AgentAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  lastUserMessage: Annotation({
    default: null,
    reducer: (prev, update) => update,
  }),
  user_id: Annotation({
    default: null,
    reducer: (prev, update) => update,
  }),
  agentQueue: Annotation({
    default: null,
    reducer: (prev, update) => update,
  }),
  agentOutputs: Annotation({
    default: null,
    reducer: (prev, update) => update,
  }),
  finalOutput: Annotation({
    default: null,
    reducer: (prev, update) => update,
  }),
});

const routerLLM = llm;

async function routerNode(state) {
  if (state.agentQueue?.length > 0) {
    return { ...state };
  }

  if (state.agentQueue?.length === 0) {
    return { agentQueue: null };
  }

  const lastMsg = state.messages[state.messages.length - 1].content;

  const decision = await routerLLM.invoke([
    new HumanMessage(routerPrompt),
    new HumanMessage(`Mensagem do usuário: ${lastMsg}`),
  ]);

  const queue = decision.content.split(",").map((s) => s.trim().toLowerCase());

  return {
    agentQueue: queue,
    agentOutputs: [],
    lastUserMessage: lastMsg,
    user_id: state.user_id,
  };
}

async function knowledgeNode(state) {
  const query = state.lastUserMessage;

  const result = await knowledgeAgent.invoke({
    messages: [new HumanMessage(knowledgePrompt), new HumanMessage(query)],
  });

  return {
    agentOutputs: [
      ...state.agentOutputs,
      new AIMessage(
        result?.messages[result.messages.length - 1].content ||
          "Não foi possível obter uma resposta."
      ),
    ],
    agentQueue: state.agentQueue?.slice(1),
  };
}

async function supportNode(state) {
  const query = state.lastUserMessage;

  const result = await customerSupportAgent.invoke({
    messages: [
      new HumanMessage(supportPrompt),
      new HumanMessage(query),
      new HumanMessage(`User ID: ${state.user_id}`),
    ],
  });

  return {
    agentOutputs: [
      ...state.agentOutputs,
      new AIMessage(
        result?.messages[result.messages.length - 1].content ||
          "Não foi possível obter uma resposta."
      ),
    ],
    agentQueue: state.agentQueue?.slice(1),
  };
}

async function searchNode(state) {
  const query = state.lastUserMessage;

  const result = await searchAgent.invoke({
    messages: [new HumanMessage(searchPrompt), new HumanMessage(query)],
  });

  return {
    agentOutputs: [
      ...state.agentOutputs,
      new AIMessage(
        result?.messages[result.messages.length - 1].content ||
          "Não foi possível obter uma resposta."
      ),
    ],
    agentQueue: state.agentQueue?.slice(1),
  };
}

async function personalityNode(state) {
  const result = await personalityAgent.invoke({
    messages: [
      new HumanMessage(
        personalityPrompt +
          state.agentOutputs.map((output) => output.content).join("\n")
      ),
    ],
  });

  return {
    finalOutput: result?.messages[result.messages.length - 1].content,
  };
}

const workflow = new StateGraph(AgentAnnotation)
  .addNode("router", routerNode)
  .addNode("knowledge", knowledgeNode)
  .addNode("support", supportNode)
  .addNode("search", searchNode)
  .addNode("personality", personalityNode)
  .addEdge(START, "router")
  .addEdge("knowledge", "router")
  .addEdge("support", "router")
  .addEdge("search", "router")
  .addConditionalEdges(
    "router",
    (state) => {
      return state.agentQueue?.[0] || "personality";
    },
    ["knowledge", "support", "search", "personality"]
  )
  .addEdge("personality", END);

export const routerAgent = workflow.compile({
  checkpointer: new MemorySaver(),
});
