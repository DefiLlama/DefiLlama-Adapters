
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function getTokensAndOwners(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    fromBlock,
    onlyArgs: true,
    topic: 'IrsInstance(address,address,uint256,uint256,int24,address,address,address,uint8,uint8)',
    eventAbi: 'event IrsInstance (address indexed underlyingToken, address indexed rateOracle, uint256 termStartTimestampWad, uint256 termEndTimestampWad, int24 tickSpacing, address marginEngine, address vamm, address fcm, uint8 yieldBearingProtocolID, uint8 underlyingTokenDecimals)',
  })

  return logs.map(i => ([i.underlyingToken, i.marginEngine]))
}

async function tvl(api) {
  return sumTokens2({ api, tokensAndOwners: await getTokensAndOwners(api), })
}

module.exports = {
  methodology: `It takes the list of all the Margin Engines deployed by the Voltz Factory and aggregates their token holdings. These token holdings represent the margin that supports liquidity provider and trader positions in Voltz interest rate swap pools.`,
};

const config = {
  ethereum: { factory: '0x6a7a5c3824508D03F0d2d24E0482Bea39E08CcAF', fromBlock: 14878442 },
  arbitrum: { factory: '0xda66a7584da7210fd26726EFb12585734F7688c1', fromBlock: 60246384 },
  avax: { factory: '0xda66a7584da7210fd26726EFb12585734F7688c1', fromBlock: 30096058 },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})