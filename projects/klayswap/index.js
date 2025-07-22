const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const kslp = require('../helper/abis/kslp');
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')

const singlePoolFactory = '0xD1890D8F02F4C63553658ba49C53A82eb84009e6'

async function singlePoolTvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'uint8:getPoolCount', itemAbi: 'function getPoolAddressByIndex(uint idx) public view returns (address)', target: singlePoolFactory })
  const tokens = await api.multiCall({ abi: 'address:token', calls: pools })
  const toa = tokens.map((val, i) => ([val, pools[i]]))
  return sumTokens2({ api, tokensAndOwners: toa})
}

const dexTVL = getUniTVL({
  useDefaultCoreAssets: true,
  factory: ADDRESSES.klaytn.KSP,
  abis: {
    allPairsLength: kslp.getPoolCount,
    allPairs: kslp.pools,
    token0: kslp.tokenA,
    token1: kslp.tokenB,
    getReserves: kslp.getCurrentPool,
  },
  exports
})

module.exports = {
  methodology: 'TVL counts the liquidity of KlaySwap DEX and staking counts the KSP that has been staked',
  klaytn: {
    tvl: sdk.util.sumChainTvls([singlePoolTvl, dexTVL,]),
    staking: staking('0x2f3713f388bc4b8b364a7a2d8d57c5ff4e054830', ADDRESSES.klaytn.KSP)
  },
  misrepresentedTokens: true,
}