const { sumTokens2 } = require('../helper/unwrapLPs')
const tokens = require('../hermes-v2/tokens.json')

const getStrategies = "function getStrategies() view returns (address[] memory)"
const tokenId = "function tokenId() view returns (uint256)"

async function stakedLPsTVL(api) {

  const talosStakedFactory = "0x17B4f847f9B071298f3eF0DAd5FCB20453bd537D"

  const strategies = await api.call({ abi: getStrategies, target: talosStakedFactory})

  const positionIds = (await api.multiCall({ abi: tokenId, calls: strategies})).slice(1) // remove the first one

  return await sumTokens2({
    chain: "arbitrum",
    resolveUniV3: true,
    uniV3ExtraConfig: { positionIds },
    tokens,
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "The sum of all TALOS strategies' Uniswap V3 NFTs.",
  arbitrum: {
    tvl: () => 0,
    staking: stakedLPsTVL,
  },
};
