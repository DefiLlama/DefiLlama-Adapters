const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    marketManager: "0xDe2b77bcbAEf4C5ECE3b827B21fbD8556e8Fa5a4",
    usd: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
  }
};

Object.keys(config).forEach(chain => {
  const { marketManager, usd } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const ownerTokens = [[[usd], marketManager]];
      return sumTokens2({ api, ownerTokens });
    }
  };
});

