import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { readFileSync } from "fs";

async function readFile(file: string): Promise<string> {
	return readFileSync(file, "utf8");
}

export async function embedFiles(files: string[], vaultPath: string): Promise<number[][]> {
	// FIXME: Make it configurable
	const embeddings = new OllamaEmbeddings({
		model: "llama2", // default value
		baseUrl: "http://localhost:11434", // default value
	});

	const fileContents = await Promise.all(files.map((file) => readFile(`${vaultPath}/${file}`)));

	const documentEmbeddings = await embeddings.embedDocuments(fileContents);
	return documentEmbeddings;
}
