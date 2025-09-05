import { tool } from "@langchain/core/tools";
import { readFileSync } from "fs";

const raw = readFileSync(new URL("../utils/users.json", import.meta.url));
const data = JSON.parse(raw);

function getData(userId) {
  const userData = data.users.find((user) => user.id == userId);
  return userData;
}
export const customerSupport = tool(
  async ({ message, userId }) => {
    const userData = getData(userId) || "Usuário não encontrado";
    return `👩‍💻 Suporte para o usuário ${userId}: recebemos a mensagem "${message}" e encontramos esses dados: ${JSON.stringify(
      userData
    )}`;
  },
  {
    name: "customer_support",
    description: "Atendimento ao usuário baseado no userId.",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        userId: { type: "string" },
      },
      required: ["message", "userId"],
    },
  }
);

export const hasIssuesInAccount = tool(
  async ({ message, userId }) => {
    const userData = getData(userId)?.issues || "Conta não localizada";
    return `Usuário ${userId}: recebemos a mensagem "${message}" e encontramos esses dados: ${JSON.stringify(
      userData
    )}`;
  },
  {
    name: "customer_support",
    description: "Atendimento ao usuário baseado no userId.",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        userId: { type: "string" },
      },
      required: ["message", "userId"],
    },
  }
);
