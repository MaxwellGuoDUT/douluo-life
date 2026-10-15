// Display aliases for the element stages recorded by advanceElement.
// Raw trait IDs remain in snapshots, history, RNG and diagnostics.
const elements={fire:'火',water:'水',earth:'土',metal:'金',wood:'木',ice:'冰',wind:'风',lightning:'雷',light:'光',dark:'暗',life:'生命',death:'死亡',poison:'毒',space:'空间',time:'时间',strength:'力量',speed:'速度',defense:'防御',spirit:'精神',destruction:'毁灭',solar:'太阳',moon:'月亮',haze:'岚'};
const stages={ultimate:'极致属性','law-seed':'法则种子','complete-law':'完整法则'};
export function playerTraitName(value){
 const text=typeof value==='string'?value:value?.name??value?.text??value?.title??value?.id??'未命名';
 const m=/^(?:douluo2:|formal:)element\.(.+)\.(ultimate|law-seed|complete-law)$/u.exec(text);
 return m?`${elements[m[1]]??m[1]}元素 · ${stages[m[2]]}`:text;
}
