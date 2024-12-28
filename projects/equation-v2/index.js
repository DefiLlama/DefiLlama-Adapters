const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    marketManager: "0x719Cf2A5bDb64BC47B72556A1439eF4b876D5A0C",
    usd: ADDRESSES.arbitrum.USDT
  }
};

Object.keys(config).forEach(chain => {
  const { marketManager, usd } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = [[[usd], marketManager]];
      return sumTokens2({ api, ownerTokens });
    }
  };
});

