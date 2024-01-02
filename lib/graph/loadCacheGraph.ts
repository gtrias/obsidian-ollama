type graphFile = {
	file: string;
};

const loadGraph = async (appId: string): Promise<graphFile[]> => {
	return new Promise((resolve, reject) => {
		let db: IDBDatabase;
		const request = indexedDB.open(`${appId}-cache`);

		request.onerror = (event) => {
			console.error("Error opening database");
			console.error(event);
			reject(event);
		};
		request.onsuccess = async (event: {
			target: { result: IDBDatabase };
		}) => {
			console.log("Success!");
			db = event.target.result;

			const results: graphFile[] = [];

			const objectStore = await db
				.transaction("file")
				.objectStore("file");

			objectStore.openCursor().onsuccess = (event: {
				target: { result: IDBCursor };
			}) => {
				const cursor = event.target.result;
				if (cursor) {
					// console.log("Name for SSN " + cursor.key + " is " + JSON.stringify(cursor.value));

					const metadataObjectStore = db
						.transaction("metadata")
						.objectStore("metadata");
					const request = metadataObjectStore.get(cursor.value.hash);
					request.onsuccess = (event) => {
						const metadata = event.target.result;
						// console.log(metadata);
						const result = { file: cursor.key, ...metadata }; // Append file key to metadata
						results.push(result); // Store the result in the array
					};

					cursor.continue();
				} else {
					console.log("No more entries!");
					resolve(results); // Resolve the promise with the results array
				}
			};
		};
	});
};

export default loadGraph;
