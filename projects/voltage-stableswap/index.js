const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const FUSD_ADDRESS = '0xd0ce1b4a349c35e61af02f5971e71ac502441e49'.toLowerCase()
const STABLESWAP_ADDRESS = '0x2a68D7C6Ea986fA06B2665d08b4D08F5e7aF960c'.toLowerCase()

const STABLES = [ADDRESSES.fuse.USDC, ADDRESSES.fuse.USDT, ADDRESSES.fuse.BUSD]

module.exports = {
  fuse: {
    tvl: sumTokensExport({ owners: [STABLESWAP_ADDRESS, FUSD_ADDRESS], tokens: STABLES, })
  }
}
