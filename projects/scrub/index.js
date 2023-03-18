const { unknownTombs, sumTokensExport } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

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
  misrepresentedTokens: true,
  cronos: { tvl: () => 0},
  kava: {
    staking: sumTokensExport({
      chain: "kava",
      tokensAndOwners: [
        ['0x990e157fC8a492c28F5B50022F000183131b9026', '0xBD98813A2F43587CCeC8c0489a5486d1f6Ef9C50'], // Lion Staking round 1
        ['0x990e157fC8a492c28F5B50022F000183131b9026', '0x3367716f07A85C04340B01D95B618d02c681Be2e'], // Lion Staking round 2
        ['0x990e157fC8a492c28F5B50022F000183131b9026', '0x83E315fC68F97EaFf04468D05eb084C9eD36f649'], // Lion Staking round 3
        ['0x990e157fC8a492c28F5B50022F000183131b9026', '0x199A0CD96065f50F9f7978c7BB47869503a9eD1E'], // Lion cave
        ['0x471F79616569343e8e84a66F342B7B433b958154', '0x67041094c4fc1492A1AB988Fb8De0ab4A0a4A080'], // Tiger staking
      ],
      lps,
      useDefaultCoreAssets: true,
      minLPRatio: 1,
      restrictTokenRatio: 500,
    }),
  },
};

module.exports = mergeExports([module.exports, lionStaking]);
