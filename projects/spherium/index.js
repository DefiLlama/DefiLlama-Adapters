const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");
const abi = require("./abi.json");
const { getTokenNames, getTokenAddress, getTokenAmount } = require("./utils");
const { BSC, ETH, AVAX, POLYGON } = require('./constants');

function chainTvl(chain) {
  return async (_timestamp, _block, chainBlocks) => {
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

const supportedChains = [ETH, BSC, POLYGON, AVAX]
function chainsBuilder() {
  const chains = {}

  supportedChains.forEach(chain => {  
    chains[chain] = { tvl: chainTvl(chain) }
  })

  return chains
}

module.exports = {
  ...chainsBuilder()
};
