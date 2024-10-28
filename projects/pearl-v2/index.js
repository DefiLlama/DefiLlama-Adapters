const ADDRESSES = require('../helper/coreAssets.json')
const { uniV3Export } = require('../helper/uniswapV3')

const ownTokens = [
  '0xaec9e50e3397f9ddc635c6c429c8c7eca418a143',
  ADDRESSES.real.RWA,
  '0x25ea98ac87a38142561ea70143fd44c4772a16b6',
]

module.exports = uniV3Export({
  'real': { factory: '0xeF0b0a33815146b599A8D4d3215B18447F2A8101', fromBlock: 33062, blacklistedTokens: ownTokens,}
})