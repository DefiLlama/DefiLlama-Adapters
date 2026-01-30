const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const config = {
  linea: {
    toa: [
      // [tokenAddress, ownerAddress]
      [ADDRESSES.linea.USDC, '0x168fca57a05354b8d889ecee78d978040690ee5a'], // Vault (BTC pair v032, deploy block 26715568)
    ],
  },
}

module.exports = {
  methodology: 'Counts USDC locked in Denaria Vault(s) on Linea.',
}

Object.keys(config).forEach(chain => {
  const { toa = [] } = config[chain]
  module.exports[chain] = {
    tvl:  sumTokensExport({ tokensAndOwners: toa })
  }
})

