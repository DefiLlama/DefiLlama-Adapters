const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const kslp = require('../helper/abis/kslp');
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')

const singlePoolFactory = '0x504722a6eabb3d1573bada9abd585ae177d52e7a'

async function singlePoolTvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'uint8:getPoolCount', itemAbi: 'function getPoolAddressByIndex(uint idx) public view returns (address)', target: singlePoolFactory })
  const tokens = await api.multiCall({ abi: 'address:token', calls: pools })
  const toa = tokens.map((val, i) => ([val, pools[i]]))
  return sumTokens2({ api, tokensAndOwners: toa})
}

const dexTVL = getUniTVL({
  useDefaultCoreAssets: true,
  factory: '0x9f3044f7f9fc8bc9ed615d54845b4577b833282d',
  abis: {
    allPairsLength: kslp.getPoolCount,
    allPairs: kslp.pools,
    getReserves: kslp.getCurrentPool,
  },
  exports
})

module.exports = {
  polygon: {
    tvl: sdk.util.sumChainTvls([dexTVL, singlePoolTvl]),
    staking: staking('0x176b29289f66236c65c7ac5db2400abb5955df13', '0x82362ec182db3cf7829014bc61e9be8a2e82868a')
  },
  misrepresentedTokens: true,
}