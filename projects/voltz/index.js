
const sdk = require('@defillama/sdk');
const ethers = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')

async function getTokensAndOwners(block) {
  const Factory = '0x6a7a5c3824508D03F0d2d24E0482Bea39E08CcAF'
  const { output: logs } = await sdk.api.util.getLogs({
    keys: [],
    toBlock: block,
    target: Factory,
    fromBlock: 14878442,
    topic: 'IrsInstance(address,address,uint256,uint256,int24,address,address,address,uint8,uint8)',
  })

  let iface = new ethers.utils.Interface(['event IrsInstance (address indexed underlyingToken, address indexed rateOracle, uint256 termStartTimestampWad, uint256 termEndTimestampWad, int24 tickSpacing, address marginEngine, address vamm, address fcm, uint8 yieldBearingProtocolID, uint8 underlyingTokenDecimals)'])
  return logs.map((log) => iface.parseLog(log).args).map(i => ([i[0], i[5]]))
}

async function tvl(_, block) {
  return sumTokens2({
    tokensAndOwners: await getTokensAndOwners(block),
    block,
  });
}

module.exports = {
  ethereum: {
    tvl,
  },
  methodology: `It takes the list of all the Margin Engines deployed by the Voltz Factory and aggregates their token holdings. These token holdings represent the margin that supports liquidity provider and trader positions in Voltz interest rate swap pools.`,
};