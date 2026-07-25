import { Player } from "./player.js";
import { EventManager } from "./event.js";

export class Game {
    constructor() {
        this.player = null;
        this.eventManager = new EventManager();
    }

    startNewGame() {
        this.player = new Player();

        console.log("新的斗罗人生开始！");
        console.log(this.player);

        return this.triggerCurrentEvent();
    }

    nextYear() {
        this.player.age += 1;

        return this.triggerCurrentEvent();
    }

    getCurrentEvent() {
        return this.eventManager.getEvent(this.player);
    }

    triggerCurrentEvent() {
        const event = this.getCurrentEvent();
        const eventAge = this.player.age;

        this.applyEffects(event);

        this.player.history.push({
            age: eventAge,
            event
        });

        return event;
    }

    applyEffects(event) {
        const effects = event.effects;

        if (!effects || typeof effects !== "object" || Array.isArray(effects)) {
            throw new TypeError(`Event "${event.id}" effects must be an object.`);
        }

        Object.entries(effects).forEach(([key, value]) => {
            if (!Object.prototype.hasOwnProperty.call(this.player, key)) {
                throw new TypeError(`Event "${event.id}" effect key "${key}" is not a Player property.`);
            }

            if (typeof value === "number") {
                if (Number.isNaN(value)) {
                    throw new TypeError(`Event "${event.id}" effect value for "${key}" must be a number.`);
                }

                if (typeof this.player[key] !== "number") {
                    throw new TypeError(`Event "${event.id}" effect key "${key}" must target a numeric Player property.`);
                }

                this.player[key] += value;
                return;
            }

            if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "set")) {
                this.player[key] = value.set;
                return;
            }

            throw new TypeError(`Event "${event.id}" effect value for "${key}" must be a number or set operation.`);
        });
    }
}
