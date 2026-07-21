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
        return this.eventManager.getEventByAge(this.player.age);
    }

    triggerCurrentEvent() {
        const event = this.getCurrentEvent();

        this.player.history.push({
            age: this.player.age,
            event
        });

        return event;
    }
}
