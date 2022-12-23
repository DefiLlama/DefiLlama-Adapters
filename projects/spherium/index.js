const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { supportedChains, bridgeAddr } = require("./constants");
const { sumTokens2 } = require('../helper/unwrapLPs')

const blackList = new Set(["SPHRI"]);

function chainTvl(chain) {
  return async (_timestamp, _block, {[chain]: block}) => {
    const tokens = await getTokens(chain, block)
    return sumTokens2({ chain, block, owner: bridgeAddr, tokens, })
  };
}

async function getTokens(chain, block) {
  let { output: tokenNames } = await sdk.api.abi.call({
    target: bridgeAddr,
    abi: abi.getAllWhitelistedTokenNames,
    chain, block,
  })
  tokenNames = tokenNames.filter(i => !blackList.has(i))
  const { output: tokens } = await sdk.api.abi.multiCall({
    target: bridgeAddr,
    abi: abi.whitelistedTokenAddress,
    calls: tokenNames.map(i => ({ params: i})),
    chain, block,
  })
  return tokens.map(i => i.output)
}

module.exports = {}

supportedChains.forEach((chain) => {
  module.exports[chain] = { tvl: chainTvl(chain) };
});