const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const MR_TOKEN = '0xf0cb96a4011a0a6f73d100c7080bf8020d10f87a'
const POOL_MANAGER = '0x498581ff718922c3f8e6a244956af099b2652b2b'
const UNI_V4_POSITION_IDS = ['500329', '415619'] // protocol-owned + locked mr_lightspeed/ETH Uniswap v4 positions (NFT IDs)
const WETH_BASE = '0x4200000000000000000000000000000000000006'

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

async function staking(api) {
  const locked = await api.call({ abi: 'erc20:balanceOf', target: MR_TOKEN, params: [MR_TOKEN] })
  api.add(MR_TOKEN, locked)
  return api.getBalances()
}

module.exports = {
  timetravel: true,
  start: '2025-10-23',
  methodology: 'TVL counts ETH collateral locked in protocol-owned Uniswap v4 positions. Staking captures the 500M MR tokens that remain vested inside the CreatorCoin contract.',
  doublecounted: false,
  base: {
    tvl,
    staking,
  },
}
