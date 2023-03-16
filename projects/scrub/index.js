const { stakingPricedLP } = require("../helper/staking");
const { unknownTombs, sumTokensExport } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

const token = [
  "0x990e157fC8a492c28F5B50022F000183131b9026",
  "0x38481Fdc1aF61E6E72E0Ff46F069315A59779C65",
];
const rewardPool = ["0xC0608A81Fe9850360B899D5eFC9f34D1cCd58D55"];
const lps = Object.values({
  "LION-USDC-LP": "0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b",
  "TIGER-USDC-LP": "0x6Eff7d2D494bc13949523e3504dE1994a6325F0A",
  "BEAR-WBTC-LP": "0x9e334ce82f7659d2967C92a4a399aD694F63bbCF",
});

module.exports = unknownTombs({
  lps,
  shares: [
    "0x471F79616569343e8e84a66F342B7B433b958154", //Tiger
  ],
  rewardPool,
  masonry: ["0x0dB75Ef798a12312afd98d1884577664f4DD4411"],
  chain: "kava",
  useDefaultCoreAssets: true,
});
module.exports.misrepresentedTokens = true;

const lionStaking = {
  cronos: { tvl: () => 0},
  kava: {
    staking: sumTokensExport({
      chain: "kava",
      owner: "0xBD98813A2F43587CCeC8c0489a5486d1f6Ef9C50",
      tokens: ["0x990e157fC8a492c28F5B50022F000183131b9026"],
      lps: ["0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b"],
      useDefaultCoreAssets: true,
    }),
  },
};
const lionStakingSecondRound = {
  kava: {
    staking: sumTokensExport({
      chain: "kava",
      owner: "0x3367716f07A85C04340B01D95B618d02c681Be2e",
      tokens: ["0x990e157fC8a492c28F5B50022F000183131b9026"],
      lps: ["0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b"],
      useDefaultCoreAssets: true,
    }),
  },
};

const lionStakingThirdRound = {
  kava: {
    staking: sumTokensExport({
      chain: "kava",
      owner: "0x83E315fC68F97EaFf04468D05eb084C9eD36f649",
      tokens: ["0x990e157fC8a492c28F5B50022F000183131b9026"],
      lps: ["0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b"],
      useDefaultCoreAssets: true,
    }),
  },
};

const lionCave = {
  kava: {
    staking: sumTokensExport({
      chain: "kava",
      owner: "0x199A0CD96065f50F9f7978c7BB47869503a9eD1E",
      tokens: ["0x990e157fC8a492c28F5B50022F000183131b9026"],
      lps: ["0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b"],
      useDefaultCoreAssets: true,
    }),
  },
};

//address tiger stake: 0x2d4F96b3cdAEB79165459199B93baD49A8533C23
const tigerStaking = {
  kava: {
    staking: sumTokensExport({
      chain: "kava",
      owner: "0x67041094c4fc1492A1AB988Fb8De0ab4A0a4A080",
      tokens: ["0x471F79616569343e8e84a66F342B7B433b958154"],
      lps: ["0x6Eff7d2D494bc13949523e3504dE1994a6325F0A"],
      useDefaultCoreAssets: true,
    }),
  },
};

module.exports = mergeExports([module.exports, lionCave, tigerStaking, lionStakingThirdRound, lionStakingSecondRound, lionStaking]);
