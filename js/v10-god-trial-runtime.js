// Source-derived second-tier closure: douluo1-pack-C6xEgEus.js:67480-67552, 67893-67951.
// Rewards remain in the original claimHumanGodTrialReward handler.
export const V10_GOD_TRIAL_SEMANTICS = 'douluo1:second-tier-god-trial/5';
export const V10_GOD_TRIAL_STAGES = Object.freeze([
  {
    "tier": "二级",
    "stage": 1,
    "poolId": "87c55c94-35e5-4c77-ad00-160aa645340d",
    "stepId": "humanGodTrialReward:二级:1",
    "minLevel": 40,
    "final": false,
    "expectedOptionIds": [
      "fce23c",
      "6067bc",
      "3cee97",
      "298f20",
      "34f9a9",
      "d39438",
      "c99bf2"
    ]
  },
  {
    "tier": "二级",
    "stage": 2,
    "poolId": "b70b29ee-d16a-482a-acd5-f4766118403e",
    "stepId": "humanGodTrialReward:二级:2",
    "minLevel": 50,
    "final": false,
    "expectedOptionIds": [
      "a51bcf",
      "f1edd2",
      "03e26e",
      "7977a8",
      "5e1906",
      "57beab",
      "eb7079"
    ]
  },
  {
    "tier": "二级",
    "stage": 3,
    "poolId": "719740e5-c236-4789-8452-b6709f399848",
    "stepId": "humanGodTrialReward:二级:3",
    "minLevel": 60,
    "final": false,
    "expectedOptionIds": [
      "724989",
      "732d8e",
      "4f31c3",
      "bb4214",
      "77dcf9",
      "7028e0",
      "bb83e1"
    ]
  },
  {
    "tier": "二级",
    "stage": 4,
    "poolId": "93581e61-e5d1-4d61-b459-e8d5a681dd6c",
    "stepId": "humanGodTrialReward:二级:4",
    "minLevel": 70,
    "final": false,
    "expectedOptionIds": [
      "93617b",
      "5cb38f",
      "b00d32",
      "e1b499",
      "c36cbe",
      "8a9b12",
      "1be1e3"
    ]
  },
  {
    "tier": "二级",
    "stage": 5,
    "poolId": "7bbd3eca-b89e-43aa-9c0f-a5d9fde1adbb",
    "stepId": "humanGodTrialReward:二级:5",
    "minLevel": 80,
    "final": false,
    "expectedOptionIds": [
      "03a21a",
      "bc7f4a",
      "8585e7",
      "53d116",
      "1c6945",
      "5386c1",
      "6e21db"
    ]
  },
  {
    "tier": "二级",
    "stage": 6,
    "poolId": "8e4d13cd-09d6-4f19-83cd-109d3c45e5e2",
    "stepId": "humanGodTrialReward:二级:6",
    "minLevel": 90,
    "final": false,
    "expectedOptionIds": [
      "c23951",
      "622967",
      "98209d",
      "e3fc46",
      "e13fca",
      "7ba1f5",
      "3f5c8b"
    ]
  },
  {
    "tier": "二级",
    "stage": 7,
    "poolId": "bb4afe49-5662-4d1f-9c18-a57080fd6b53",
    "stepId": "humanGodTrialReward:二级:7",
    "minLevel": 95,
    "final": false,
    "expectedOptionIds": [
      "cc5672",
      "df5512",
      "8262a1",
      "ce6f8b",
      "b5c156",
      "0267a8",
      "81f15e",
      "bfcac9"
    ]
  },
  {
    "tier": "二级",
    "stage": 8,
    "poolId": "d0f66513-26f2-40f7-8194-ceb79812a644",
    "stepId": "humanGodTrialReward:二级:8",
    "minLevel": 99,
    "final": true,
    "expectedOptionIds": [
      "05584e",
      "d9fdfb",
      "3abe5d",
      "b13dfa",
      "43e9f8",
      "a8c7fb"
    ]
  }
]);
export const V10_GOD_TRIAL_POOLS = Object.freeze([
{"id":"87c55c94-35e5-4c77-ad00-160aa645340d","name":"二级神考核第一考奖励（要求40级以上才可以抽取）","options":[{"id":"fce23c","text":"容貌+1（ex级无法提升则重抽）","wheelLabel":"容貌+1","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":1},{"type":"godTrialRewardUnclaimed","stage":1},{"type":"levelAtLeast","value":40}],"rerollWhen":[{"type":"appearanceRankIs","value":7}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"6067bc","text":"获得领域雏形，90级后获得完整领域，进入完整领域抽取池（无法重复获得领域雏形，否则重抽）","wheelLabel":"获得领域雏形，90级后获…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":1},{"type":"godTrialRewardUnclaimed","stage":1},{"type":"levelAtLeast","value":40}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomainPrototype"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"3cee97","text":"获得当前神位神器胚胎，完成最终考核成为完整神器（无法重复获得）","wheelLabel":"获得当前神位神器胚胎，完…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":1},{"type":"godTrialRewardUnclaimed","stage":1},{"type":"levelAtLeast","value":40}],"rerollWhen":[{"type":"hasFlag","value":"godTrialArtifact"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"298f20","text":"获得魂力提升，等级+6（最高达到99级）","wheelLabel":"获得魂力提升，等级+6","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":1},{"type":"godTrialRewardUnclaimed","stage":1},{"type":"levelAtLeast","value":40}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"34f9a9","text":"全部魂环提升1000年","wheelLabel":"全部魂环提升1000年","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":1},{"type":"godTrialRewardUnclaimed","stage":1},{"type":"levelAtLeast","value":40}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"d39438","text":"获得一块6万年魂骨（进入魂骨抽取池）","wheelLabel":"获得一块6万年魂骨","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":1},{"type":"godTrialRewardUnclaimed","stage":1},{"type":"levelAtLeast","value":40}],"customHandler":"claimHumanGodTrialReward","next":"humanPrepareSoulBonePart"},{"id":"c99bf2","text":"获得当前神位的领域（无法重复获得，否则重抽）","wheelLabel":"获得当前神位的领域","weight":10,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":1},{"type":"godTrialRewardUnclaimed","stage":1},{"type":"levelAtLeast","value":40}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomain"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]},
{"id":"b70b29ee-d16a-482a-acd5-f4766118403e","name":"二级神考核第二考奖励（要求50级以上才可抽取）","options":[{"id":"a51bcf","text":"容貌+1（ex级无法提升则重抽）","wheelLabel":"容貌+1","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":2},{"type":"godTrialRewardUnclaimed","stage":2},{"type":"levelAtLeast","value":50}],"rerollWhen":[{"type":"appearanceRankIs","value":7}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"f1edd2","text":"获得领域雏形，90级后获得完整领域，进入完整领域抽取池（无法重复获得领域雏形，否则重抽）","wheelLabel":"获得领域雏形，90级后获…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":2},{"type":"godTrialRewardUnclaimed","stage":2},{"type":"levelAtLeast","value":50}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomainPrototype"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"03e26e","text":"获得当前神位神器胚胎，完成最终考核成为完整神器（无法重复获得）","wheelLabel":"获得当前神位神器胚胎，完…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":2},{"type":"godTrialRewardUnclaimed","stage":2},{"type":"levelAtLeast","value":50}],"rerollWhen":[{"type":"hasFlag","value":"godTrialArtifact"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"7977a8","text":"获得魂力提升，等级+5（最高达到99级）","wheelLabel":"获得魂力提升，等级+5","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":2},{"type":"godTrialRewardUnclaimed","stage":2},{"type":"levelAtLeast","value":50}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"5e1906","text":"全部魂环提升2000年","wheelLabel":"全部魂环提升2000年","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":2},{"type":"godTrialRewardUnclaimed","stage":2},{"type":"levelAtLeast","value":50}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"57beab","text":"获得一块7万年魂骨（进入魂骨抽取池）","wheelLabel":"获得一块7万年魂骨","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":2},{"type":"godTrialRewardUnclaimed","stage":2},{"type":"levelAtLeast","value":50}],"customHandler":"claimHumanGodTrialReward","next":"humanPrepareSoulBonePart"},{"id":"eb7079","text":"获得当前神位的领域（无法重复获得，否则重抽）","wheelLabel":"获得当前神位的领域","weight":10,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":2},{"type":"godTrialRewardUnclaimed","stage":2},{"type":"levelAtLeast","value":50}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomain"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]},
{"id":"719740e5-c236-4789-8452-b6709f399848","name":"二级神考核第三考奖励（要求60级以上才可抽取）","options":[{"id":"724989","text":"容貌+1（ex级无法提升则重抽）","wheelLabel":"容貌+1","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":3},{"type":"godTrialRewardUnclaimed","stage":3},{"type":"levelAtLeast","value":60}],"rerollWhen":[{"type":"appearanceRankIs","value":7}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"732d8e","text":"获得领域雏形，90级后获得完整领域，进入完整领域抽取池（无法重复获得领域雏形，否则重抽）","wheelLabel":"获得领域雏形，90级后获…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":3},{"type":"godTrialRewardUnclaimed","stage":3},{"type":"levelAtLeast","value":60}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomainPrototype"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"4f31c3","text":"获得当前神位神器胚胎，完成最终考核成为完整神器（无法重复获得）","wheelLabel":"获得当前神位神器胚胎，完…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":3},{"type":"godTrialRewardUnclaimed","stage":3},{"type":"levelAtLeast","value":60}],"rerollWhen":[{"type":"hasFlag","value":"godTrialArtifact"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"bb4214","text":"获得魂力提升，等级+4（最多到99级）","wheelLabel":"获得魂力提升，等级+4","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":3},{"type":"godTrialRewardUnclaimed","stage":3},{"type":"levelAtLeast","value":60}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"77dcf9","text":"全部魂环提升3000年","wheelLabel":"全部魂环提升3000年","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":3},{"type":"godTrialRewardUnclaimed","stage":3},{"type":"levelAtLeast","value":60}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"7028e0","text":"获得一块8万年魂骨（进入魂骨抽取池）","wheelLabel":"获得一块8万年魂骨","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":3},{"type":"godTrialRewardUnclaimed","stage":3},{"type":"levelAtLeast","value":60}],"customHandler":"claimHumanGodTrialReward","next":"humanPrepareSoulBonePart"},{"id":"bb83e1","text":"获得当前神位的领域（无法重复获得，否则重抽）","wheelLabel":"获得当前神位的领域","weight":10,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":3},{"type":"godTrialRewardUnclaimed","stage":3},{"type":"levelAtLeast","value":60}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomain"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]},
{"id":"93581e61-e5d1-4d61-b459-e8d5a681dd6c","name":"二级神考核第四考奖励（要求70级以上才可抽取）","options":[{"id":"93617b","text":"容貌+1（ex级无法提升则重抽）","wheelLabel":"容貌+1","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":4},{"type":"godTrialRewardUnclaimed","stage":4},{"type":"levelAtLeast","value":70}],"rerollWhen":[{"type":"appearanceRankIs","value":7}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"5cb38f","text":"获得领域雏形，90级后获得完整领域，进入完整领域抽取池（无法重复获得领域雏形，否则重抽）","wheelLabel":"获得领域雏形，90级后获…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":4},{"type":"godTrialRewardUnclaimed","stage":4},{"type":"levelAtLeast","value":70}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomainPrototype"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"b00d32","text":"获得当前神位神器胚胎，完成最终考核成为完整神器（无法重复获得）","wheelLabel":"获得当前神位神器胚胎，完…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":4},{"type":"godTrialRewardUnclaimed","stage":4},{"type":"levelAtLeast","value":70}],"rerollWhen":[{"type":"hasFlag","value":"godTrialArtifact"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"e1b499","text":"获得魂力提升，等级+3（最多到99级）","wheelLabel":"获得魂力提升，等级+3","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":4},{"type":"godTrialRewardUnclaimed","stage":4},{"type":"levelAtLeast","value":70}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"c36cbe","text":"全部魂环提升4000年","wheelLabel":"全部魂环提升4000年","weight":45,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":4},{"type":"godTrialRewardUnclaimed","stage":4},{"type":"levelAtLeast","value":70}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"8a9b12","text":"获得一块9万年魂骨（进入魂骨抽取池）","wheelLabel":"获得一块9万年魂骨","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":4},{"type":"godTrialRewardUnclaimed","stage":4},{"type":"levelAtLeast","value":70}],"customHandler":"claimHumanGodTrialReward","next":"humanPrepareSoulBonePart"},{"id":"1be1e3","text":"获得当前神位的领域（无法重复获得，否则重抽）","wheelLabel":"获得当前神位的领域","weight":10,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":4},{"type":"godTrialRewardUnclaimed","stage":4},{"type":"levelAtLeast","value":70}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomain"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]},
{"id":"7bbd3eca-b89e-43aa-9c0f-a5d9fde1adbb","name":"二级神考核第五考奖励（要求80级以上才可抽取）","options":[{"id":"03a21a","text":"容貌+1（ex级无法提升则重抽）","wheelLabel":"容貌+1","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":5},{"type":"godTrialRewardUnclaimed","stage":5},{"type":"levelAtLeast","value":80}],"rerollWhen":[{"type":"appearanceRankIs","value":7}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"bc7f4a","text":"获得领域雏形，90级后获得完整领域，进入完整领域抽取池（无法重复获得领域雏形，否则重抽）","wheelLabel":"获得领域雏形，90级后获…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":5},{"type":"godTrialRewardUnclaimed","stage":5},{"type":"levelAtLeast","value":80}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomainPrototype"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"8585e7","text":"获得当前神位神器胚胎，完成最终考核成为完整神器（无法重复获得）","wheelLabel":"获得当前神位神器胚胎，完…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":5},{"type":"godTrialRewardUnclaimed","stage":5},{"type":"levelAtLeast","value":80}],"rerollWhen":[{"type":"hasFlag","value":"godTrialArtifact"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"53d116","text":"获得魂力提升，等级+3（最多到99级）","wheelLabel":"获得魂力提升，等级+3","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":5},{"type":"godTrialRewardUnclaimed","stage":5},{"type":"levelAtLeast","value":80}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"1c6945","text":"全部魂环提升8000年","wheelLabel":"全部魂环提升8000年","weight":50,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":5},{"type":"godTrialRewardUnclaimed","stage":5},{"type":"levelAtLeast","value":80}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"5386c1","text":"获得一块10万年魂骨（进入魂骨抽取池）","wheelLabel":"获得一块10万年魂骨","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":5},{"type":"godTrialRewardUnclaimed","stage":5},{"type":"levelAtLeast","value":80}],"customHandler":"claimHumanGodTrialReward","next":"humanPrepareSoulBonePart"},{"id":"6e21db","text":"获得当前神位的领域（无法重复获得，否则重抽）","wheelLabel":"获得当前神位的领域","weight":10,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":5},{"type":"godTrialRewardUnclaimed","stage":5},{"type":"levelAtLeast","value":80}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomain"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]},
{"id":"8e4d13cd-09d6-4f19-83cd-109d3c45e5e2","name":"二级神考核第六考奖励（要求90级以上才可抽取）","options":[{"id":"c23951","text":"容貌+1（ex级无法提升则重抽）","wheelLabel":"容貌+1","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":6},{"type":"godTrialRewardUnclaimed","stage":6},{"type":"levelAtLeast","value":90}],"rerollWhen":[{"type":"appearanceRankIs","value":7}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"622967","text":"获得领域雏形，90级后获得完整领域，进入完整领域抽取池（无法重复获得领域雏形，否则重抽）","wheelLabel":"获得领域雏形，90级后获…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":6},{"type":"godTrialRewardUnclaimed","stage":6},{"type":"levelAtLeast","value":90}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomainPrototype"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"98209d","text":"获得当前神位神器胚胎，完成最终考核成为完整神器（无法重复获得）","wheelLabel":"获得当前神位神器胚胎，完…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":6},{"type":"godTrialRewardUnclaimed","stage":6},{"type":"levelAtLeast","value":90}],"rerollWhen":[{"type":"hasFlag","value":"godTrialArtifact"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"e3fc46","text":"获得魂力提升，等级+2（最多到99级）","wheelLabel":"获得魂力提升，等级+2","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":6},{"type":"godTrialRewardUnclaimed","stage":6},{"type":"levelAtLeast","value":90}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"e13fca","text":"全部魂环提升10000年","wheelLabel":"全部魂环提升10000年","weight":55,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":6},{"type":"godTrialRewardUnclaimed","stage":6},{"type":"levelAtLeast","value":90}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"7ba1f5","text":"获得一块20万年魂骨（进入魂骨抽取池）","wheelLabel":"获得一块20万年魂骨","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":6},{"type":"godTrialRewardUnclaimed","stage":6},{"type":"levelAtLeast","value":90}],"customHandler":"claimHumanGodTrialReward","next":"humanPrepareSoulBonePart"},{"id":"3f5c8b","text":"获得当前神位的领域（无法重复获得，否则重抽）","wheelLabel":"获得当前神位的领域","weight":10,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":6},{"type":"godTrialRewardUnclaimed","stage":6},{"type":"levelAtLeast","value":90}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomain"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]},
{"id":"bb4afe49-5662-4d1f-9c18-a57080fd6b53","name":"二级神考核第七考奖励（要求95级以上才可抽取）","options":[{"id":"cc5672","text":"容貌+1（ex级无法提升则重抽）","wheelLabel":"容貌+1","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"rerollWhen":[{"type":"appearanceRankIs","value":7}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"df5512","text":"获得领域雏形，90级后获得完整领域，进入完整领域抽取池（无法重复获得领域雏形，否则重抽）","wheelLabel":"获得领域雏形，90级后获…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomainPrototype"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"8262a1","text":"获得当前神位神器胚胎，完成最终考核成为完整神器（无法重复获得）","wheelLabel":"获得当前神位神器胚胎，完…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"rerollWhen":[{"type":"hasFlag","value":"godTrialArtifact"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"ce6f8b","text":"获得魂力提升，等级+2（最多到99级）","wheelLabel":"获得魂力提升，等级+2","weight":40,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"b5c156","text":"全部魂环提升20000年","wheelLabel":"全部魂环提升20000年","weight":55,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"0267a8","text":"获得一块30万年魂骨（进入魂骨抽取池）","wheelLabel":"获得一块30万年魂骨","weight":35,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"customHandler":"claimHumanGodTrialReward","next":"humanPrepareSoulBonePart"},{"id":"81f15e","text":"获得当前神位的领域（无法重复获得，否则重抽）","wheelLabel":"获得当前神位的领域","weight":10,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"rerollWhen":[{"type":"hasFlag","value":"godTrialDomain"}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"bfcac9","text":"获得神铠着装（要求6块魂骨全齐，否则默认神考失败，进入死亡结局）","wheelLabel":"获得神铠着装","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":7},{"type":"godTrialRewardUnclaimed","stage":7},{"type":"levelAtLeast","value":95}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]},
{"id":"d0f66513-26f2-40f7-8194-ceb79812a644","name":"二级神考核第八考奖励（要求99级可抽取，成神后等级达到100级，二级神等级上限为119级）","options":[{"id":"05584e","text":"获得神铠着装（要求6块魂骨全满，否则神位继承失败，默认进入死亡结局）","wheelLabel":"获得神铠着装","weight":20,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":8},{"type":"godTrialRewardUnclaimed","stage":8},{"type":"levelAtLeast","value":99}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"d9fdfb","text":"神器位格提升1级（二级神器为真神级神器，提升1级变为超神级神器）","wheelLabel":"神器位格提升1级","weight":15,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":8},{"type":"godTrialRewardUnclaimed","stage":8},{"type":"levelAtLeast","value":99}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"3abe5d","text":"全部魂环提升20000年","wheelLabel":"全部魂环提升20000年","weight":45,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":8},{"type":"godTrialRewardUnclaimed","stage":8},{"type":"levelAtLeast","value":99}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"b13dfa","text":"合格继承，全部魂环提升30000年（要求有神器或者对应的领域其中一个，否则重抽）","wheelLabel":"合格继承，全部魂环提升3…","weight":25,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":8},{"type":"godTrialRewardUnclaimed","stage":8},{"type":"levelAtLeast","value":99}],"rerollWhen":[{"type":"allOf","conditions":[{"type":"lacksFlag","value":"godTrialArtifact"},{"type":"lacksFlag","value":"godTrialDomain"}]}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"43e9f8","text":"领域位格提升1级（二级神的领域为真神级领域，提升1级变成超神级领域）","wheelLabel":"领域位格提升1级","weight":15,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":8},{"type":"godTrialRewardUnclaimed","stage":8},{"type":"levelAtLeast","value":99}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"},{"id":"a8c7fb","text":"完美继承，神位位格提升为一级神，等级限制解除到139级（要求神器和对应的领域同时拥有，否则重抽）","wheelLabel":"完美继承，神位位格提升为…","weight":5,"enabled":true,"requirements":[{"type":"godTrialStatusIs","value":"active"},{"type":"godTrialTierIs","value":"二级"},{"type":"godTrialStageIs","value":8},{"type":"godTrialRewardUnclaimed","stage":8},{"type":"levelAtLeast","value":99}],"rerollWhen":[{"type":"anyOf","conditions":[{"type":"lacksFlag","value":"godTrialArtifact"},{"type":"lacksFlag","value":"godTrialDomain"}]}],"customHandler":"claimHumanGodTrialReward","next":"humanGodTrialContinue"}]}
]);
export const V10_GOD_TRIAL_CONTENT = JSON.stringify([V10_GOD_TRIAL_SEMANTICS, V10_GOD_TRIAL_STAGES, V10_GOD_TRIAL_POOLS]);

function boundary(code, message) { throw Object.assign(new Error(message), { code }); }
const exact = value => typeof value === 'string' ? {kind:'exact-string',value,resolved:true} : {kind:'absent'};

export function withV10GodTrialRuntime(loaded, sourcePack, route) {
    if (sourcePack?.manifest?.id !== 'douluo1' || route !== 'human') return loaded;
    if (typeof sourcePack.game?.customHandlers?.claimHumanGodTrialReward !== 'function'
        || typeof sourcePack.game?.flowActions?.continueHumanGodTrial !== 'function') {
        boundary('V10_GOD_TRIAL_SOURCE_MISSING', '二级神考缺少源奖励或继续处理器。');
    }
    const routeGraph = structuredClone(loaded.routeGraph);
    const pack = routeGraph.packs.find(item => item.id === 'douluo1');
    for (const dependency of ['humanPrepareSoulBonePart', 'humanSoulBonePart', 'humanGodTrialContinue']) {
        if (!pack.flows.some(flow => flow.id === dependency)) {
            boundary('V10_GOD_TRIAL_CLOSURE_MISSING', '二级神考缺少后继流程：' + dependency);
        }
    }
    for (const sourcePool of V10_GOD_TRIAL_POOLS) {
        if (pack.pools.some(pool => pool.id === sourcePool.id)) {
            boundary('V10_GOD_TRIAL_SOURCE_DRIFT', '二级奖励池已存在，必须先核对来源：' + sourcePool.id);
        }
        const source = structuredClone(sourcePool);
        pack.pools.push({id:source.id,source,options:source.options.map(option=>({
            id:option.id,source:option,route:{next:exact(option.next),customHandler:exact(option.customHandler),
                followUps:[],requirements:option.requirements??[],rerollWhen:option.rerollWhen??[],effects:[]}
        }))});
    }
    for (const stage of V10_GOD_TRIAL_STAGES) {
        if (pack.flows.some(flow=>flow.id===stage.stepId)) boundary('V10_GOD_TRIAL_SOURCE_DRIFT', '二级奖励流程已存在：'+stage.stepId);
        const source={id:stage.stepId,poolId:stage.poolId};
        pack.flows.push({id:source.id,source,route:{pool:exact(source.poolId),next:exact(),action:exact(),
            getNext:exact(),leaveNext:exact(),possibleNext:[]}});
    }
    pack.v10GodTrialSemantics=V10_GOD_TRIAL_SEMANTICS;
    return {...loaded,routeGraph};
}

export function planV10GodTrialReward(contentIndex, session) {
    if (contentIndex?.pack?.v10GodTrialSemantics !== V10_GOD_TRIAL_SEMANTICS) return null;
    const trial=session.character.godTrial;
    if (!trial || trial.tier !== '二级' || trial.status !== 'active' || !trial.deityId) return null;
    const stage=V10_GOD_TRIAL_STAGES.find(item=>item.stage===trial.currentStage);
    if (!stage || !Array.isArray(trial.claimedRewardStages)) boundary('V10_GOD_TRIAL_STATE_INVALID','二级神考阶段或领取记录无效。');
    if (trial.claimedRewardStages.includes(trial.currentStage) || session.character.level < stage.minLevel) return null;
    if (!contentIndex.getFlow(stage.stepId)) boundary('V10_GOD_TRIAL_CLOSURE_MISSING','二级奖励流程未注册：'+stage.stepId);
    return {target:stage.stepId,effects:[],reason:'v10-second-tier-god-trial-reward'};
}

export function evaluateV10GodTrialRequirement(record, character, fallback) {
    const requirement=record?.normalized?.requirement??record?.requirement??record;
    const trial=character.godTrial;
    let met;
    switch(requirement?.type) {
        case 'godTrialStatusIs': met=trial?.status===requirement.value; break;
        case 'godTrialTierIs': met=trial?.tier===requirement.value; break;
        case 'godTrialStageIs': met=trial?.currentStage===requirement.value; break;
        case 'godTrialRewardUnclaimed': met=!!trial && Array.isArray(trial.claimedRewardStages) && !trial.claimedRewardStages.includes(requirement.stage); break;
        default: return fallback(record,character);
    }
    return {status:met?'met':'not_met',requirementType:requirement.type};
}
