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
        ['TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5', 'TKha7zcAXZMaaWzoVmUHtvVFqr9GeiChgJ'],
        [ADDRESSES.tron.USDT, 'TDUkQbjrXs6xUbxGCLknWwJHxVTdysXBhy'],
        [ADDRESSES.tron.USDT, 'TSUYvQ5tdd3DijCD1uGunGLpftHuSZ12sQ'],
      ]
    })
  },
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.ethereum.USDT, '0x217e42CEB2eAE9ECB788fDF0e31c806c531760A3'], // PSM-USDT-A GemJoin
        [ADDRESSES.ethereum.USDC, '0x9A7E1B324060dB7342aeA08c0dc56F55CEd6F519'], // PSM-USDC-A GemJoin
      ]
    })
  },
  bsc: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.bsc.USDT, '0xe229FdA620B8a9B98ef184830EE3063F0F86B790'], // PSM-BUSD-A GemJoin
      ]
    })
  }
}