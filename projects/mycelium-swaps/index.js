const { sumTokens2 } = require("../helper/unwrapLPs");
const { getParamCalls } = require("../helper/utils");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const chain = "arbitrum";
const vault = "0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855";

const getSwapsTvl = () => {
  return async (_, _block, { [chain]: block }) => {
    const { output: numTokens } = await sdk.api.abi.call({
      target: vault,
      abi: abi.allWhitelistedTokensLength,
      chain,
      block,
    });

    const { output: tokenAddresses } = await sdk.api.abi.multiCall({
      target: vault,
      abi: abi.allWhitelistedTokens,
      calls: getParamCalls(numTokens),
      chain,
      block,
    });

    const sumTokens = await sumTokens2({
      owner: vault,
      tokens: tokenAddresses.map((i) => i.output),
      chain,
      block,
    });

    return sumTokens;
  };
};

module.exports = {
  arbitrum: {
    tvl: getSwapsTvl(),
  },
};
