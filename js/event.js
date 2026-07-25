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
                effects: {
                    power: 2
                },
                weight: 100,
                next: []
            },
            {
                id: "growth_lucky_001",
                title: "天生灵慧",
                text: "你的眼神比同龄孩子更灵动，家人都觉得你天生带着几分福缘。",
                trigger: {
                    age: 2,
                    attributes: {
                        luck: {
                            min: 15
                        }
                    },
                    hasEvent: [
                        "birth_001"
                    ]
                },
                tags: [
                    "growth",
                    "talent"
                ],
                effects: {
                    intelligence: 1,
                    luck: 1
                },
                weight: 30,
                next: []
            },
            {
                id: "growth_memory_001",
                title: "最初的记忆",
                text: "你开始记得这个世界的声音、气味，以及家人讲述的斗罗大陆传说。",
                trigger: {
                    age: 3,
                    hasTag: [
                        "birth"
                    ]
                },
                tags: [
                    "growth",
                    "memory"
                ],
                effects: {
                    intelligence: 2
                },
                weight: 40,
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

    getEvent(player) {
        const availableEvents = this.getAvailableEvents(player);

        if (availableEvents.length === 0) {
            return this.defaultEvent;
        }

        return this.pickWeightedEvent(availableEvents);
    }

    getAvailableEvents(player) {
        return this.events.filter(event => this.matchTrigger(event, player));
    }

    matchTrigger(event, player) {
        const trigger = event.trigger || {};

        if (typeof trigger.age === "number" && player.age !== trigger.age) {
            return false;
        }

        if (typeof trigger.minAge === "number" && player.age < trigger.minAge) {
            return false;
        }

        if (typeof trigger.maxAge === "number" && player.age > trigger.maxAge) {
            return false;
        }

        if (!this.matchAttributeTriggers(trigger.attributes, player)) {
            return false;
        }

        if (!this.matchHistoryIds(trigger.hasEvent || [], player)) {
            return false;
        }

        if (!this.matchHistoryTags(trigger.hasTag || [], player)) {
            return false;
        }

        return true;
    }

    matchAttributeTriggers(attributes, player) {
        if (!attributes) {
            return true;
        }

        return Object.entries(attributes).every(([key, condition]) => {
            if (typeof player[key] !== "number") {
                return false;
            }

            if (typeof condition === "number") {
                return player[key] === condition;
            }

            if (!condition || typeof condition !== "object" || Array.isArray(condition)) {
                return false;
            }

            if (typeof condition.min === "number" && player[key] < condition.min) {
                return false;
            }

            if (typeof condition.max === "number" && player[key] > condition.max) {
                return false;
            }

            if (typeof condition.equals === "number" && player[key] !== condition.equals) {
                return false;
            }

            return true;
        });
    }

    matchHistoryIds(requiredIds, player) {
        return requiredIds.every(id => player.history.some(record => record.event.id === id));
    }

    matchHistoryTags(requiredTags, player) {
        return requiredTags.every(tag => {
            return player.history.some(record => record.event.tags.includes(tag));
        });
    }

    pickWeightedEvent(events) {
        const totalWeight = events.reduce((sum, event) => sum + event.weight, 0);

        if (totalWeight <= 0) {
            return events[0];
        }

        let roll = Math.random() * totalWeight;

        for (const event of events) {
            roll -= event.weight;

            if (roll <= 0) {
                return event;
            }
        }

        return events[events.length - 1];
    }

    validateEvents() {
        [...this.events, this.defaultEvent].forEach(event => {
            if (!event.trigger || typeof event.trigger !== "object" || Array.isArray(event.trigger)) {
                throw new TypeError(`Event "${event.id}" trigger must be an object.`);
            }

            if (!Array.isArray(event.tags)) {
                throw new TypeError(`Event "${event.id}" tags must be an array.`);
            }

            if (event.trigger.hasEvent && !Array.isArray(event.trigger.hasEvent)) {
                throw new TypeError(`Event "${event.id}" trigger.hasEvent must be an array.`);
            }

            if (event.trigger.hasTag && !Array.isArray(event.trigger.hasTag)) {
                throw new TypeError(`Event "${event.id}" trigger.hasTag must be an array.`);
            }

            if (!Object.prototype.hasOwnProperty.call(event, "effects")) {
                throw new TypeError(`Event "${event.id}" must include effects.`);
            }

            if (!event.effects || typeof event.effects !== "object" || Array.isArray(event.effects)) {
                throw new TypeError(`Event "${event.id}" effects must be an object.`);
            }

            if (typeof event.weight !== "number" || Number.isNaN(event.weight) || event.weight < 0) {
                throw new TypeError(`Event "${event.id}" weight must be a non-negative number.`);
            }
        });
    }
}
