const { getUniTVL } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FARM_FACTORY = '0x951AFf794ffD122e4EA90B8BcFeE722c05f7133D'
const DEX_FACTORY = '0x356037CbC77B3A2B36E0484d96DF0De247e66785'

async function farms(api) {
  const farms = await api.call({
    target: FARM_FACTORY,
    abi: 'function getAllFarms() view returns (address[])'
  })

  const lpTokens = await api.multiCall({
    abi: 'address:lpToken',
    calls: farms
  })

  const balances = await api.multiCall({
    abi: 'uint256:totalStaked',
    calls: farms
  })

  const tokensAndOwners = lpTokens.map((lp, i) => [lp, farms[i]])
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'TVL includes tokens locked in Qom X DEX liquidity pools + tokens staked in Qom X farms on BSC.',
  bsc: {
    tvl: getUniTVL({
      factory: DEX_FACTORY,
      useDefaultCoreAssets: true,
    }),
    staking: farms,   // this will show as "Staking" TVL on DefiLlama
  }
}
