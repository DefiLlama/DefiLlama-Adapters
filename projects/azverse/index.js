const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const custodyWallets = [
  '0x03a7e58745874d49b3acc770c40261a3ce206608',
  '0xc2a290eceac480f057b6e7b45a7a949535e478ce',
  '0xdc379823a9a3a2ca9d77c33299551ecdbabf7a41',
]

const assetVault = '0x91ba525861c16aa8cd4d6974e4058cc846f42ebe'

const configs = {
  arbitrum: {
    owners: [assetVault, ...custodyWallets],
    tokens: [
      ADDRESSES.null,
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    ],
  },
  ethereum: {
    owners: custodyWallets,
    tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC],
  },
  bsc: {
    owners: custodyWallets,
    tokens: [ADDRESSES.null, ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
  },
  berachain: {
    owners: custodyWallets,
    tokens: ['0x779ded0c9e1022225f8e0630b35a9b54be713736'],
  },
}

async function tvl(api) {
  return api.sumTokens(configs[api.chain])
}

for (const chain of Object.keys(configs)) {
  module.exports[chain] = { tvl }
}

module.exports.bitcoin = {
  tvl: sumTokensExport({ owners: ['13JJtAGYdjYdHiqBcs9zAy95aWzvbW4Nx6'] }),
}

module.exports.methodology = 'Counts supported assets in AZVerse’s Arbitrum Asset Vault and third-party qualified-custodian wallets, plus BTC in the designated Bitcoin hot wallet.'
