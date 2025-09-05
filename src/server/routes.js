import express from "express";
import { routerAgent } from "../agents/router.js";
import { HumanMessage } from "@langchain/core/messages";

const router = express.Router();

router.post("/agent", async (req, res) => {
  const { message, user_id } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    const state = await routerAgent.invoke(
      {
        messages: [new HumanMessage(`User (${user_id || "anon"}): ${message}`)],
        user_id: user_id || "anon",
      },
      {
        configurable: { thread_id: user_id || "anon-thread" },
        recursionLimit: 25,
      }
    );

    const reply = state.finalOutput;

    res.json({ reply });
  } catch (error) {
    console.error("Erro no RouterAgent:", error);
    res.status(500).json({ error: "Erro no roteamento." });
  }
});

export default router;
