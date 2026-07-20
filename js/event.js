export class EventManager {
    constructor() {
        this.events = [
            {
                age: 0,
                title: "降临斗罗大陆",
                text: "你在斗罗大陆出生了，新的人生即将开始。"
            },
            {
                age: 1,
                title: "初次成长",
                text: "在家人的照顾下，你平安地度过了人生中的第一年。"
            }
        ];

        this.defaultEvent = {
            title: "平静的一年",
            text: "这一年没有发生特别的事情，你仍在慢慢成长。"
        };
    }

    getEventByAge(age) {
        return this.events.find(event => event.age === age) || this.defaultEvent;
    }
}
