import { env } from "../config/env.js";

type EmbeddingResponse = {
  data: Array<{ embedding: number[] }>;
};

const provider = env.EMBEDDING_PROVIDER ?? "openai";

export const createEmbeddings = async (inputs: string[]) => {
  if (provider !== "openai") {
    throw new Error("Embedding provider nao configurado.");
  }
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY nao configurada.");
  }
  const model = env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: inputs
    })
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao gerar embeddings.");
  }
  const payload = (await response.json()) as EmbeddingResponse;
  return payload.data.map((item) => item.embedding);
};

export const chunkText = (text: string, size = 800, overlap = 120) => {
  if (!text) return [];
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    const end = Math.min(text.length, index + size);
    chunks.push(text.slice(index, end));
    if (end === text.length) break;
    index = end - overlap;
  }
  return chunks;
};
