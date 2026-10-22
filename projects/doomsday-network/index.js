const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const WDOOM_TOKEN = '0x623c84A5E04bF715018203334b0eFE41696eBC3E'
const UNISWAP_V3_POOL = '0xf7217329574249d7b389404aECF2C582662F3659'

module.exports = {
  methodology: 'Tracks WETH and 1:1 vault-backed Wrapped Doomsday (wDOOM) liquidity locked in the burned Uniswap v3 pool on Base Mainnet.',
  base: {
    tvl: sumTokensExport({
      owner: UNISWAP_V3_POOL,
      tokens: [ADDRESSES.base.WETH],
    }),
    pool2: sumTokensExport({
      owner: UNISWAP_V3_POOL,
      tokens: [WDOOM_TOKEN, ADDRESSES.base.WETH],
    }),
  },
}
