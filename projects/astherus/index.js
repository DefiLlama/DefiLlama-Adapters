const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/solana')

const config = {
  bsc: '0x128463A60784c4D3f46c23Af3f65Ed859Ba87974',
  ethereum: '0x604DD02d620633Ae427888d41bfd15e38483736E'
}

module.exports = {
  start: '2024-01-31', // 02/01/2024 @ 00:00:00pm (UTC)
}

Object.keys(config).forEach(chain => {
  const vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { data } = await getConfig(`astherus/${api.chain}`, `https://astherus.finance/bapi/futures/v1/public/future/web3/ae-deposit-asset?chainId=${api.chainId}`)
      const tokens = data.map(i => i.contractAddress)
      return api.sumTokens({ owner: vault, tokens })
    }
  }
})

module.exports['solana'] = {
  tvl: async function (...rest) {
    const { data: tokens } = await getConfig(`astherus/solana`, `https://astherus.finance/bapi/futures/v1/public/future/web3/ae-deposit-asset?network=SOL`)
    return sumTokens2({ tokenAccounts: tokens.map(({ tokenVault }) => [tokenVault]).flat() })
  }
}
