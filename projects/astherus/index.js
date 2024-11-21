const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/solana')
const ethers = require('ethers')

const config = {
  bsc: '0x128463A60784c4D3f46c23Af3f65Ed859Ba87974',
  ethereum: '0x604DD02d620633Ae427888d41bfd15e38483736E'
}
const asBTCContract = '0x184b72289c0992BDf96751354680985a7C4825d6'

module.exports = {
  start: 1706716800, // 02/01/2024 @ 00:00:00pm (UTC)
}

const getAsBTCTVL = async () => {
  const { data: asTokensPrice } = await getConfig(`astherus/token-price`, `https://www.astherus.finance/bapi/futures/v1/public/future/earn/getAssTokenPrice`)
  const { assTokenTotalSupply} = asTokensPrice?.find(token => token.assTokenName === 'asBTC') ?? {}
  return assTokenTotalSupply
}

Object.keys(config).forEach(chain => {
  const vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { data } = await getConfig(`astherus/${api.chain}`, `https://astherus.finance/bapi/futures/v1/public/future/web3/ae-deposit-asset?chainId=${api.chainId}`)
      const tokens = data.map(i => i.contractAddress)
      if (chain === 'bsc') {
        const asBTCTVL = await getAsBTCTVL()
        api.addToken(asBTCContract, ethers.parseEther(asBTCTVL.toString()).toString())
      }
      await api.sumTokens({ owner: vault, tokens })
      return api.getBalances()
    },
  }
})

module.exports['solana'] = {
  tvl: async function (...rest) {
    const { data: tokens } = await getConfig(`astherus/solana`, `https://astherus.finance/bapi/futures/v1/public/future/web3/ae-deposit-asset?network=SOL`)
    return sumTokens2({ tokenAccounts: tokens.map(({ tokenVault }) => [tokenVault]).flat() })
  }
}
