export class UI {
    showGameArea() {
        const gameArea = document.getElementById("gameArea");
        gameArea.style.display = "block";
    }

    renderPlayer(player) {
        const playerName = document.getElementById("playerName");
        const playerAge = document.getElementById("playerAge");
        const playerStats = document.getElementById("playerStats");

        playerName.textContent = `姓名：${player.name}`;
        playerAge.textContent = `年龄：${player.age} 岁`;

        const stats = [
            ["等级", player.level],
            ["HP", player.hp],
            ["力量", player.power],
            ["敏捷", player.agility],
            ["智力", player.intelligence],
            ["幸运", player.luck]
        ];

        playerStats.innerHTML = "";

        stats.forEach(([label, value]) => {
            const statItem = document.createElement("p");
            statItem.className = "player-stat";
            statItem.textContent = `${label}：${value}`;

            playerStats.appendChild(statItem);
        });
    }

    renderEvent(event) {
        const eventTitle = document.getElementById("eventTitle");
        const eventText = document.getElementById("eventText");

        eventTitle.textContent = event.title;
        eventText.textContent = event.text;
    }

    renderHistory(history) {
        const historyList = document.getElementById("historyList");

        historyList.innerHTML = "";

        history.forEach(record => {
            const historyItem = document.createElement("li");
            historyItem.textContent = `${record.age}岁：${record.event.title}`;

            historyList.appendChild(historyItem);
        });
    }
}
