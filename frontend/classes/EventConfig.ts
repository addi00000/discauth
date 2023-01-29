export class EventConfig {
    name: String;

    constructor(title: String) {
        this.name = title;

        if (!this.name) {
            throw Error('All values of "EventConfig" class are must be provided.');
        }
    }
}