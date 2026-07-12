const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const POOL_MANAGER = '0x498581ff718922c3f8e6a244956af099b2652b2b'
// protocol-owned + locked mr_lightspeed/ETH Uniswap v4 positions (NFT IDs)
const UNI_V4_POSITION_IDS = ['500329', '415619', '932416','795399', '718288','717261', '659231', '651606'] 

async function tvl(api) {
  return sumTokens2({
    api,
    resolveUniV4: true,
    owner: POOL_MANAGER,
    uniV4ExtraConfig: {
      positionIds: UNI_V4_POSITION_IDS,
      whitelistedTokens: [nullAddress, ADDRESSES.base.WETH],
    },
  })
}

module.exports = {
  base: {
    tvl,
  },
}
