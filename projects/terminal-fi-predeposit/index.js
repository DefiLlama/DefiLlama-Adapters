const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.ethereum.sUSDe, '0xFaAE52c6A6d477f859a740a76B29c33559ace18c'],
        [ADDRESSES.ethereum.USDe, '0xFaAE52c6A6d477f859a740a76B29c33559ace18c'],
        [ADDRESSES.ethereum.WEETH, '0xe042678e6c6871fa279e037c11e390f31334ba0b'],
        [ADDRESSES.ethereum.WETH, '0xe042678e6c6871fa279e037c11e390f31334ba0b'],
        [ADDRESSES.ethereum.WBTC, '0x2db1ec186acdeaf7d0fc78bffe335560b0fe0085'],
      ]
    }),
  }
}