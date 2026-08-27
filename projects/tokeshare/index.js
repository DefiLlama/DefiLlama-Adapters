const { getConfig } = require('../helper/cache')

const TOKENS_API = 'https://tokeshare.co/api/tokens'

// defillama chain -> evm chainId used by the api
const EVM_CHAINS = {
  ethereum: 1,
  polygon: 137,
  base: 8453,
}

async function getTokens() {
  const { tokens } = await getConfig('tokeshare', TOKENS_API)
  return tokens.filter((token) => !token.isRWA)
}

function evmTvl(chainId) {
  return async (api) => {
    const tokens = await getTokens()

    const collateral = []
    tokens.forEach((token) => {
      token.contracts
        .filter((contract) => contract.chainId === chainId)
        .forEach(({ address, collateralToken }) => {
          if (collateralToken) collateral.push([collateralToken.address, address])
        })
    })

    if (collateral.length) await api.sumTokens({ tokensAndOwners: collateral })

    return api.getBalances()
  }
}

const evmChains = Object.fromEntries(
  Object.entries(EVM_CHAINS).map(([chain, chainId]) => [
    chain,
    { tvl: evmTvl(chainId) },
  ])
)

module.exports = {
  methodology:
    'Tokens backed by collateral held onchain are counted as the balance of that collateral, held by the token contract itself.',
  ...evmChains,
  timetravel: false,
  start: '2025-06-13'
}
