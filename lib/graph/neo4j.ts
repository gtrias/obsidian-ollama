import { Neo4jGraph } from "langchain/graphs/neo4j_graph";

const initializeNeo4j = async ({
	url,
	username,
	password,
}: {
	url: string;
	username: string;
	password: string;
}) => {
	// FIXME: Handle connection errors
	const graph = await Neo4jGraph.initialize({ url, username, password });

	// Create neo4j schema for obsidian linked notes
	await graph.query(
		"CREATE CONSTRAINT ON (n:Note) ASSERT n.id IS UNIQUE"
	);
};

export { initializeNeo4j };
