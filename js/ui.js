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
            ["境界", player.rank],
            ["武魂", player.spirit || "未觉醒"],
            ["魂环", this.formatSoulRings(player.soulRings)],
            ["魂骨", this.formatSoulBones(player.soulBones)],
            ["学院", player.academy || "未入学"],
            ["势力", player.faction || "无"],
            ["身份", player.title],
            ["金钱", player.money],
            ["声望", player.reputation]
        ];

        playerStats.innerHTML = "";

        stats.forEach(([label, value]) => {
            const statItem = document.createElement("p");
            statItem.className = "player-stat";
            statItem.textContent = `${label}：${value}`;

            playerStats.appendChild(statItem);
        });
    }

    formatSoulRings(soulRings) {
        if (soulRings.length === 0) {
            return "无";
        }

        return soulRings.map(ring => `${ring.tier}${ring.age}年`).join("、");
    }

    formatSoulBones(soulBones) {
        const ownedBones = Object.entries(soulBones)
            .filter(([, bone]) => bone)
            .map(([part, bone]) => `${this.getSoulBonePartName(part)}:${bone.tier}${bone.age}年`);

        return ownedBones.length > 0 ? ownedBones.join("、") : "无";
    }

    getSoulBonePartName(part) {
        const names = {
            head: "头部",
            torso: "躯干",
            leftArm: "左臂",
            rightArm: "右臂",
            leftLeg: "左腿",
            rightLeg: "右腿",
            external: "外附"
        };

        return names[part] || part;
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
