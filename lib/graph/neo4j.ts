import { Neo4jGraph } from "langchain/graphs/neo4j_graph";

const initializeNeo4j = async ({
	url,
	username,
	password,
	data,
}: {
	url: string;
	username: string;
	password: string;
	data: any;
}) => {
	// FIXME: Handle connection errors
	console.log("Connecting with neo4j", url, username, password);
	const graph = await Neo4jGraph.initialize({ url, username, password });

	// Create neo4j schema for obsidian linked notes
	const query = `
		UNWIND $data AS row
		MERGE (note:Note {id: row.file})
		ON CREATE SET note.file = row.file
		FOREACH (tag IN row.tags |
			MERGE (t:Tag {id: tag.tag})
			MERGE (note)-[:TAGGED]->(t)
		)
		FOREACH (heading IN row.headings |
			MERGE (h:Heading {name: heading.heading}
				ON CREATE SET h.level = heading.level
				MERGE (note)-[:HEADING]->(h)
				FOREACH (link IN heading.links |
					MERGE (note)-[:LINKED]->(l:Note {id: link.link})))
		`;

	console.log("Running query: ", query);
	console.log("With data: ", data);
	await graph.query(query, { data: data });
	// Refresh schema
	await graph.refreshSchema();

	console.log("Neo4j initialized");
};

export { initializeNeo4j };
