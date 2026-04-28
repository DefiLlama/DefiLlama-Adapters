const { sumTokensExport } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

// Elusiv — Solana privacy protocol (sunset, TVL remains locked in pool)
// Pool address: HszJz1zLnYpK5e8TvsRDPSDrxc19qFuhWrFQG6xY2aMX

module.exports = {
  deadFrom: '2024-01-01', // protocol sunset
  methodology: 'Total value of all tokens held in the Elusiv privacy pool smart contract',
  solana: {
    tvl: sumTokensExport({
      owners: ['HszJz1zLnYpK5e8TvsRDPSDrxc19qFuhWrFQG6xY2aMX'],
      tokens: [
        ADDRESSES.solana.USDC,
        ADDRESSES.solana.USDT,
        ADDRESSES.solana.BONK,
      ],
      solOwners: ['HszJz1zLnYpK5e8TvsRDPSDrxc19qFuhWrFQG6xY2aMX'],
    }),
  },
}
