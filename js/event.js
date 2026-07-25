import academyEvents from "../data/events/academy.json" with { type: "json" };
import birthEvent from "../data/events/birth.json" with { type: "json" };
import defaultEvent from "../data/events/default.json" with { type: "json" };
import growthEvents from "../data/events/growth.json" with { type: "json" };
import spiritEvents from "../data/events/spirit.json" with { type: "json" };

export class EventManager {
    constructor() {
        this.events = [
            ...this.normalizeEvents(birthEvent),
            ...this.normalizeEvents(growthEvents),
            ...this.normalizeEvents(spiritEvents),
            ...this.normalizeEvents(academyEvents)
        ];

        this.defaultEvent = defaultEvent;

        this.validateEvents();
    }

    normalizeEvents(events) {
        return Array.isArray(events) ? events : [events];
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

        if (!this.matchStateTriggers(trigger.state, player)) {
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

            return this.matchNumberCondition(player[key], condition);
        });
    }

    matchNumberCondition(value, condition) {
        if (typeof condition === "number") {
            return value === condition;
        }

        if (!condition || typeof condition !== "object" || Array.isArray(condition)) {
            return false;
        }

        if (typeof condition.min === "number" && value < condition.min) {
            return false;
        }

        if (typeof condition.max === "number" && value > condition.max) {
            return false;
        }

        if (typeof condition.equals === "number" && value !== condition.equals) {
            return false;
        }

        if (typeof condition.gt === "number" && value <= condition.gt) {
            return false;
        }

        if (typeof condition.gte === "number" && value < condition.gte) {
            return false;
        }

        if (typeof condition.lt === "number" && value >= condition.lt) {
            return false;
        }

        if (typeof condition.lte === "number" && value > condition.lte) {
            return false;
        }

        if (typeof condition.eq === "number" && value !== condition.eq) {
            return false;
        }

        return true;
    }

    matchStateTriggers(state, player) {
        if (!state) {
            return true;
        }

        return Object.entries(state).every(([key, value]) => {
            if (!Object.prototype.hasOwnProperty.call(player, key)) {
                return false;
            }

            return player[key] === value;
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

            if (event.trigger.state && (typeof event.trigger.state !== "object" || Array.isArray(event.trigger.state))) {
                throw new TypeError(`Event "${event.id}" trigger.state must be an object.`);
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
