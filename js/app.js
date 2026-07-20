import { Game } from "./game.js";
import { UI } from "./ui.js";

const game = new Game();
const ui = new UI();

const newGameBtn = document.getElementById("newGameBtn");
const nextYearBtn = document.getElementById("nextYearBtn");

newGameBtn.addEventListener("click", () => {
    const event = game.startNewGame();

    ui.showGameArea();
    ui.renderPlayer(game.player);
    ui.renderEvent(event);
});

nextYearBtn.addEventListener("click", () => {
    const event = game.nextYear();

    ui.renderPlayer(game.player);
    ui.renderEvent(event);
});
