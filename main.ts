import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';

import Neo4jSettingsTab from './settings_tabs/neo4j_settings_tab';

// Remember to rename these classes and interfaces!

interface OllamaPluginSettings {
	neo4jUrl: string;
	neo4jUser: string;
	neo4jPassword: string;
}

const DEFAULT_SETTINGS: OllamaPluginSettings = {
	neo4jUrl: "",
	neo4jUser: "",
	neo4jPassword: "",
}

const loadGraph = async (appId: string) => {
	return new Promise((resolve, reject) => {
		let db;
		const request = indexedDB.open(`${appId}-cache`);

		request.onerror = (event) => {
			console.error("Error opening database");
			console.error(event);
			reject(event);
		};
		request.onsuccess = async (event) => {
			console.log("Success!");
			db = event.target.result;

			const results = [];

			const objectStore = await db.transaction("file").objectStore("file");

			objectStore.openCursor().onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					// console.log("Name for SSN " + cursor.key + " is " + JSON.stringify(cursor.value));

					const metadataObjectStore = db.transaction("metadata").objectStore("metadata");
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
}


export default class OllamaPlugin extends Plugin {
	settings: OllamaPluginSettings;

	async onload() {
		await this.loadSettings();

		const graph = await loadGraph(this.app.appId);
		console.log("graph: ", graph)

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('ollama');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure neo4j settings
		this.addSettingTab(new Neo4jSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
