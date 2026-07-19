import { Game } from "./game.js";

const game = new Game();

const newGameBtn = document.getElementById("newGameBtn");

newGameBtn.addEventListener("click", () => {
    game.startNewGame();
});