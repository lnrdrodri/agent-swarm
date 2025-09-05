import { tool } from "@langchain/core/tools";

export const web_search = tool(
  async (query) => {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API Serper: ${response.statusText}`);
    }

    const data = await response.json();

    const results =
      data.organic?.map((r) => `- ${r.title}\n${r.snippet}\nLink: ${r.link}`) ??
      [];

    return results.join("\n\n");
  },
  {
    name: "web_search",
    description: "Busca no Google usando Serper API. Retorna links e snippets.",
  }
);
