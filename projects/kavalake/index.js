const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is calculated based on the amount of WKAVA held in the KavaLake liquid staking vault on Kava EVM.",
  kava: {
    tvl: sumTokensExport({
      owners: ['0x46ffa1b9a9f027fA958dF9276e3EdCf099A58882'], // KavaLake vault
      tokens: ['0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b'], // WKAVA
    }),
  },
};
