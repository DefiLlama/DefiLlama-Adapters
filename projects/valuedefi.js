
const { getUniTVL } = require('./helper/unknownTokens')
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

const bscDexTVL = getUniTVL({ factory: swapFactory, useDefaultCoreAssets: true, })

async function bscStableSwapTvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'allPoolsLength', itemAbi: 'allPools', target: stableSwapFactory })
  const tokens = await api.fetchList({ lengthAbi: abis.getTokenLength, itemAbi: abis.getToken, targets: pools, groupedByInput: true })
  const ownerTokens = tokens.map((i, idx) => ([i, pools[idx]]))
  return sumTokens2({ ownerTokens, api })
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([bscDexTVL, bscStableSwapTvl]),
  }
}
