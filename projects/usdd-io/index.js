const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')


// https://docs.usdd.io/introduction/collateral-asset-contract-addresses
module.exports = {
  tron: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.tron.WTRX, 'TJ1VWPvFVq7sVsN7J7dWJVZz4SLT14qRUr'],
        [ADDRESSES.tron.WTRX, 'TGQKnHDQNyc3QeHJ7YxH8wggdg89UVXyvX'],
        [ADDRESSES.tron.WTRX, 'TPUPPLTYLdbW4jxwD5g2T7ystxsR9HL2mt'],
        [ADDRESSES.tron.USDT, 'TDUkQbjrXs6xUbxGCLknWwJHxVTdysXBhy'],
        [ADDRESSES.tron.USDT, 'TSUYvQ5tdd3DijCD1uGunGLpftHuSZ12sQ'],
      ]
    })
  }
}