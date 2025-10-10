const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/solana')

// https://docs.asterdex.com/overview/what-is-aster/our-smart-contracts
const config = {
  bsc: '0x128463A60784c4D3f46c23Af3f65Ed859Ba87974',
  ethereum: '0x604DD02d620633Ae427888d41bfd15e38483736E',
  scroll: '0x7BE980E327692Cf11E793A0d141D534779AF8Ef4',
  arbitrum: '0x9E36CB86a159d479cEd94Fa05036f235Ac40E1d5',
}

const blacklistedTokens = [
  '0x78f5d389f5cdccfc41594abab4b0ed02f31398b3', // apx
  '0x000ae314e2a2172a039b26378814c252734f556a', // aster
]
module.exports = {
  start: '2024-01-31', // 02/01/2024 @ 00:00:00pm (UTC)
}

function checkEvmAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr)
}

Object.keys(config).forEach(chain => {
  const vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { data } = await getConfig(`astherus/${api.chain}`, `https://astherus.finance/bapi/futures/v1/public/future/web3/ae-deposit-asset?chainId=${api.chainId}`)
      const tokens = data.map(i => i.contractAddress).filter(checkEvmAddress)
      return api.sumTokens({ owner: vault, tokens, blacklistedTokens })
    }
  }
})

module.exports['solana'] = {
  tvl: async function (...rest) {
    const { data } = await getConfig(`astherus/solana`, `https://astherus.finance/bapi/futures/v1/public/future/web3/ae-deposit-asset?network=SOL`)
    const tokens = data.filter(({ tokenVault }) => tokenVault && tokenVault.length > 0).map(({ tokenVault }) => tokenVault)
    return sumTokens2({ tokenAccounts: tokens })
  }
}
