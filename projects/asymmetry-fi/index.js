const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.ethereum.WSTETH, '0x972a53e3a9114f61b98921fb5b86c517e8f23fad'],
        [ADDRESSES.ethereum.RETH, '0x7b6633c0cd81dc338688a528c0a3f346561f5ca3'],
        [ADDRESSES.ethereum.sfrxETH, '0x36ce17a5c81e74dc111547f5dffbf40b8bf6b20a'],
      ]
    })
  }
}