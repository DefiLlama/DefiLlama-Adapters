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
  return tokens
}

function evmTvl(chainId) {
  return async (api) => {
    const tokens = await getTokens()
    const deployments = []
    tokens.forEach((token) => {
      token.deployments
        .filter((deployment) => deployment.chainId === chainId)
        .forEach((deployment) => deployments.push({ token, address: deployment.address }))
    })

    if (!deployments.length) return api.getBalances()

    const supplies = await api.multiCall({
      abi: 'erc20:totalSupply',
      calls: deployments.map((i) => i.address),
    })

    let usdValue = 0
    deployments.forEach(({ token }, i) => {
      usdValue += (Number(supplies[i]) / 10 ** token.decimals) * token.price.value
    })
    api.addUSDValue(usdValue)

    return api.getBalances()
  }
}

async function stellarTvl(api) {
  const tokens = await getTokens()

  let usdValue = 0
  tokens.forEach((token) => {
    if (!token.deployments.some((deployment) => deployment.chain === 'Stellar')) return
    if (!token.totalSupply) return
    usdValue += Number(token.totalSupply) * token.price.value
  })
  api.addUSDValue(usdValue)

  return api.getBalances()
}

const evmChains = Object.fromEntries(
  Object.entries(EVM_CHAINS).map(([chain, config]) => [
    chain,
    { tvl: evmTvl(config) },
  ])
)

module.exports = {
  methodology:
    'TVL is the value of every real world asset token issued by Tokeshare: total supply of each token onchain multiplied by its unit price.',
  stellar: { tvl: stellarTvl },
  ...evmChains,
}