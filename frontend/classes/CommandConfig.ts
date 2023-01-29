export class CommandConfig {
    title: String;
    description: String;
    category: String;
    aliases: Array<String>;

    constructor(title: String, description: String, category: String, aliases: Array<String>) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.aliases = aliases;

        if (!this.title || !this.description || !this.category || !this.aliases) {
            throw Error('All values of "CommandConfig" class are must be provided.');
        }
    }
}