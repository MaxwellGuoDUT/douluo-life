export class Player {
    constructor() {
        this.name = "主角";

        this.age = 0;
        this.level = 1;

        this.spirit = null;
        this.academy = null;
        this.faction = null;
        this.soulRings = [];
        this.soulBones = {
            head: null,
            torso: null,
            leftArm: null,
            rightArm: null,
            leftLeg: null,
            rightLeg: null,
            external: null
        };
        this.rank = "未觉醒";
        this.title = "平民";
        this.money = 0;
        this.reputation = 0;

        this.history = [];
    }
}
