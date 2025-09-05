import { tool } from "@langchain/core/tools";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import dotenv from "dotenv";

dotenv.config();

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-ada-002",
});

const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabaseClient,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever({
  k: 5,
});

export const ragRetrieve = tool(
  async ({ query }) => {
    try {
      const results = await retriever.invoke(query);
      const text = results.map((r) => r.pageContent).join("\n\n");

      return text || "Nenhum resultado encontrado.";
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
    }
  },
  {
    name: "rag_retrieve",
    description:
      "Recupera informações do site https://www.infinitepay.io para RAG.",
    schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A consulta de pesquisa para recuperar informações.",
        },
      },
      required: ["query"],
    },
  }
);
