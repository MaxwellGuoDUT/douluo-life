import birthEvent from "../data/events/birth.json" with { type: "json" };

export class EventManager {
    constructor() {
        this.events = [
            birthEvent,
            {
                id: "growth_001",
                title: "初次成长",
                text: "在家人的照顾下，你平安地度过了人生中的第一年。",
                trigger: {
                    age: 1
                },
                tags: [
                    "growth"
                ],
                effects: {},
                weight: 100,
                next: []
            }
        ];

        this.defaultEvent = {
            id: "default_001",
            title: "平静的一年",
            text: "这一年没有发生特别的事情，你仍在慢慢成长。",
            trigger: {},
            tags: [
                "default"
            ],
            effects: {},
            weight: 0,
            next: []
        };

        this.validateEvents();
    }

    getEventByAge(age) {
        return this.events.find(event => event.trigger.age === age) || this.defaultEvent;
    }

    validateEvents() {
        [...this.events, this.defaultEvent].forEach(event => {
            if (!Object.prototype.hasOwnProperty.call(event, "effects")) {
                throw new TypeError(`Event "${event.id}" must include effects.`);
            }

            if (!event.effects || typeof event.effects !== "object" || Array.isArray(event.effects)) {
                throw new TypeError(`Event "${event.id}" effects must be an object.`);
            }
        });
    }
}
