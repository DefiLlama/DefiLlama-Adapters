const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is calculated based on the amount of WKAVA held in the KavaLake liquid staking vault on Kava EVM.",
  kava: {
    tvl: sumTokensExport({
      owners: ['0x46ffa1b9a9f027fA958dF9276e3EdCf099A58882'], // KavaLake vault
      tokens: [ADDRESSES.kava.WKAVA], // WKAVA
    }),
  },
};
