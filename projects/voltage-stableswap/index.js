const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const FUSD_ADDRESS = '0xd0ce1b4a349c35e61af02f5971e71ac502441e49'
const STABLESWAP_ADDRESS = '0x2a68D7C6Ea986fA06B2665d08b4D08F5e7aF960c'.toLowerCase()
const FUSD_V3_ADDRESS = ADDRESSES.fuse.FUSD_3
const PEGSWAP_ADDRESS = '0x56ee525bb9056bed23a6055e60b2a2c5c225d1db'
const PEGSWAP_V2_ADDRESS = '0xfa70dffea090fed2d6e9301fb10b0d4c81072e4c';
const SIMPLE_STAKING_ADDRESS = "0x5fFcEaa947937DE1FEBb28BCa65E84894a55a2EF"; 

const STABLES = [
  ADDRESSES.fuse.USDC,
  ADDRESSES.fuse.USDT,
  ADDRESSES.fuse.BUSD,
  ADDRESSES.fuse.USDC_2,
  ADDRESSES.fuse.USDT_2,
  ADDRESSES.fuse.BNB,
  ADDRESSES.fuse.BNB_2,
  ADDRESSES.fuse.WETH,
  ADDRESSES.fuse.WETH_2,
  ADDRESSES.fuse.USDC_3,
  ADDRESSES.fuse.USDT_3,
  ADDRESSES.fuse.WETH_3,
]

module.exports = {
  fuse: {
    tvl: sumTokensExport({
      owners: [
        STABLESWAP_ADDRESS,
        FUSD_ADDRESS,
        FUSD_V3_ADDRESS,
        PEGSWAP_ADDRESS,
        PEGSWAP_V2_ADDRESS,
        SIMPLE_STAKING_ADDRESS
      ],
      tokens: STABLES,
    }),
  },
}
