export class UI {
    showGameArea() {
        const gameArea = document.getElementById("gameArea");
        gameArea.style.display = "block";
    }

    renderPlayer(player) {
        const playerName = document.getElementById("playerName");
        const playerAge = document.getElementById("playerAge");

        playerName.textContent = `姓名：${player.name}`;
        playerAge.textContent = `年龄：${player.age} 岁`;
    }

    renderEvent(event) {
        const eventTitle = document.getElementById("eventTitle");
        const eventText = document.getElementById("eventText");

        eventTitle.textContent = event.title;
        eventText.textContent = event.text;
    }
}
