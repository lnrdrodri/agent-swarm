import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Document } from "@langchain/core/documents";
import * as cheerio from "cheerio";

import dotenv from "dotenv";

import { infinitepay_sites } from "./pages.js";

dotenv.config();

const urls = infinitepay_sites;

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function cleanHtmlContent(html) {
  const $ = cheerio.load(html);

  $(
    "script, style, header, footer, nav, aside, iframe, img, svg, noscript, form, button, input, meta, link, title"
  ).remove();
  const text = $("body")
    .contents()
    .map((_, el) => {
      if (el.type === "text") return $(el).text();
      if (el.type === "tag") return " " + $(el).text() + " ";
      return "";
    })
    .get()
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

async function ingestUrl(url) {
  console.log(`Carregando e processando URL: ${url}`);

  try {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();

    if (!docs.length) {
      console.log(`Nenhum documento encontrado na URL ${url}.`);
      return;
    }

    const originalContent = docs[0].pageContent;
    const cleanedContent = cleanHtmlContent(originalContent);

    const cleanedDoc = new Document({
      pageContent: cleanedContent,
      metadata: { ...docs[0].metadata, source: url },
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 500,
    });
    const splitDocs = await splitter.splitDocuments([cleanedDoc]);

    await SupabaseVectorStore.fromDocuments(splitDocs, new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    console.log(`Ingestão de ${url} concluída com sucesso.`);
  } catch (error) {
    console.error(`Erro ao processar a URL ${url}:`, error);
  }
}

export async function embedAllPages() {
  for (const url of urls) {
    await ingestUrl(url);
  }
  console.log("Todas as URLs foram processadas. O RAG está pronto para usar!");
}
