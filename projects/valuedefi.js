
const { getUniTVL } = require('./helper/unknownTokens')
const { createIncrementArray } = require('./helper/utils')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('./helper/unwrapLPs')
const swapFactory = '0x1b8e12f839bd4e73a47addf76cf7f0097d74c14c'
const stableSwapFactory = '0xc6e111637440d1fe9c1ee45d5a1239771b267122'

const abis = {
  allPools: "function allPools(uint256) view returns (address)",
  allPoolsLength: "uint256:allPoolsLength",
  getTokenLength: "uint256:getTokenLength",
  getToken: "function getToken(uint8 index) view returns (address)",
}

const bscDexTVL = getUniTVL({
  factory: swapFactory,
  useDefaultCoreAssets: true,
})

async function bscStableSwapTvl(api) {
  const pools = await api.fetchList({  lengthAbi: 'allPoolsLength', itemAbi: 'allPools', target: stableSwapFactory})

  const  tokenLength = await api.multiCall({    abi: abis.getTokenLength,    calls: pools,  })

  const tokenCalls = []
  tokenLength.forEach((i, idx) => {
    createIncrementArray(i).forEach(j => tokenCalls.push({ target: pools[idx], params: j }))
  })

  const tokens = await api.multiCall({    abi: abis.getToken,    calls: tokenCalls,  })

  const toa = tokens.map((i, idx) => ([i, tokenCalls[idx].target]))
  return sumTokens2({ tokensAndOwners: toa, api})
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([bscDexTVL, bscStableSwapTvl]),
  }
}
