import { Player } from "./player.js";

export class Game {
    constructor() {
        this.player = null;
    }

    startNewGame() {
        this.player = new Player();

        console.log("新的斗罗人生开始！");
        console.log(this.player);
    }
}