const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const POOL_MANAGER = '0x498581ff718922c3f8e6a244956af099b2652b2b'
const UNI_V4_POSITION_IDS = ['500329', '415619'] // protocol-owned + locked mr_lightspeed/ETH Uniswap v4 positions (NFT IDs)
const WETH_BASE = ADDRESSES.optimism.WETH_1

async function tvl(api) {
  return sumTokens2({
    api,
    resolveUniV4: true,
    owner: POOL_MANAGER,
    uniV4ExtraConfig: {
      positionIds: UNI_V4_POSITION_IDS,
      whitelistedTokens: [nullAddress, WETH_BASE],
    },
  })
}

module.exports = {
  timetravel: true,
  start: '2025-10-23',
  methodology: 'TVL counts ETH collateral locked in protocol-owned Uniswap v4 positions.',
  doublecounted: true,
  base: {
    tvl,
  },
}
