import { App, PluginSettingTab, Setting, Plugin } from 'obsidian';

export default class Neo4jSettingsTab extends PluginSettingTab {
	plugin: Plugin;

	constructor(app: App, plugin: Plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Neo4j URL')
			.setDesc('The URL of your Neo4j database')
			.addText(text => text
				.setPlaceholder('Enter your Neo4j URL')
				.setValue(this.plugin.settings.neo4jUrl)
				.onChange(async (value) => {
					this.plugin.settings.neo4jUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Neo4j User')
			.setDesc('The username of your Neo4j database')
			.addText(text => text
				.setPlaceholder('Enter your Neo4j User')
				.setValue(this.plugin.settings.neo4jUser)
				.onChange(async (value) => {
					this.plugin.settings.neo4jUser = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Neo4j Password')
			.setDesc('The password of your Neo4j database')
			.addText(text => text
				.setPlaceholder('Enter your Neo4j Password')
				.setValue(this.plugin.settings.neo4jPassword)
				.onChange(async (value) => {
					this.plugin.settings.neo4jPassword = value;
					await this.plugin.saveSettings();
				}));
	}
}