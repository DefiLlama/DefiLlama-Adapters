const { sumTokens2 } = require('../helper/unwrapLPs')

async function stakedLPsTVL(api) {
  const talosStakedFactory = "0x17B4f847f9B071298f3eF0DAd5FCB20453bd537D"
  const strategies = await api.call({ abi: 'address[]:getStrategies', target: talosStakedFactory })
  const positionIds = (await api.multiCall({ abi: 'uint256:tokenId', calls: strategies })).slice(1) // remove the first one

  return await sumTokens2({ uniV3ExtraConfig: { positionIds }, api, })
}

module.exports = {
  methodology: "The sum of all TALOS strategies' Uniswap V3 NFTs.",
  arbitrum: {
    tvl: () => 0,
    staking: stakedLPsTVL,
  },
};
