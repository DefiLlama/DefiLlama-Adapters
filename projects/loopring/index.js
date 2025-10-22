const { sumTokens2 } = require("../helper/unwrapLPs");
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x944644Ea989Ec64c2Ab9eF341D383cEf586A5777",
          "0x674bdf20A0F284D710BC40872100128e2d66Bd3f",
        ],
        fetchCoValentTokens: true,
      }),
  },
  taiko: {
    tvl: 
      sumTokensExport({
        owners: ['0x3e71a41325e1d6B450307b6535EC48627ac4DaCC'], 
        tokens: [
            ADDRESSES.null,
            ADDRESSES.taiko.USDC,
            ADDRESSES.taiko.USDT,
            ADDRESSES.taiko.DAI,
            ADDRESSES.taiko.LRC,
            ADDRESSES.taiko.TAIKO
        ]
      }),
  },
  base: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x732771F202ed19Ca8e1844d334e1df5641DC99Fe",
        ],
        fetchCoValentTokens: true,
      }),
  }
};
