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

        return this.getCurrentEvent();
    }

    nextYear() {
        this.player.age += 1;

        return this.getCurrentEvent();
    }

    getCurrentEvent() {
        return this.eventManager.getEventByAge(this.player.age);
    }
}
