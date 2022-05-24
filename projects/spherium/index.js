const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");
const abi = require("./abi.json");
const { getTokenNames, getTokenAddress, getTokenAmount } = require("./utils");

function chainTvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const transform = await getChainTransform(chain);
    const tokenNames = await getTokenNames(chain, chainBlocks);
    const balances = {};

    for (let tokenName of tokenNames) {
      let tokenAddress = await getTokenAddress(chain, chainBlocks, tokenName);
      const tokenAmount = await getTokenAmount(
        chain,
        chainBlocks,
        tokenAddress
      );

      const transformedAddress = transform(tokenAddress);
      balances[transformedAddress] = tokenAmount;
    }

    return balances;
  };
}

module.exports = {
  ethereum: {
    tvl: chainTvl("ethereum"),
  },
  bsc: {
    tvl: chainTvl("bsc"),
  },
  // polygon: {
  //   tvl: chainTvl("polygon"),
  // },
  // avax: {
  //   tvl: chainTvl("avax"),
  // },
};
