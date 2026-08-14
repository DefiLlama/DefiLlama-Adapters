const { getConfig } = require('../helper/cache')

const TOKENS_API = 'https://tokeshare.co/api/tokens'

// defillama chain -> evm chainId used by the api
const EVM_CHAINS = {
  ethereum: 1,
  polygon: 137,
  base: 8453,
}

const USD_CURRENCIES = new Set(['USD', 'USDC', 'USDT'])

async function getTokens() {
  const { tokens } = await getConfig('tokeshare', TOKENS_API)
  return tokens
}

function usdPrice(token) {
  if (!token.price || !USD_CURRENCIES.has(token.price.currency)) return 0
  return Number(token.price.value) || 0
}

function evmTvl(chainId) {
  return async (api) => {
    const tokens = await getTokens()

    const collateral = []
    const offchainBacked = []
    tokens.forEach((token) => {
      token.contracts
        .filter((contract) => contract.chainId === chainId)
        .forEach(({ address, collateralToken }) => {
          if (collateralToken) collateral.push([collateralToken.address, address])
          else offchainBacked.push({ token, address })
        })
    })

    if (collateral.length) await api.sumTokens({ tokensAndOwners: collateral })

    if (offchainBacked.length) {
      const supplies = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: offchainBacked.map((i) => i.address),
      })
      let usdValue = 0
      offchainBacked.forEach(({ token }, i) => {
        usdValue += (Number(supplies[i]) / 10 ** token.decimals) * usdPrice(token)
      })
      api.addUSDValue(usdValue)
    }

    return api.getBalances()
  }
}

async function stellarTvl(api) {
  const tokens = await getTokens()

  let usdValue = 0
  tokens.forEach((token) => {
    if (!token.contracts.some((contract) => contract.chain === 'Stellar')) return
    if (!token.totalSupply) return
    usdValue += Number(token.totalSupply) * usdPrice(token)
  })
  api.addUSDValue(usdValue)

  return api.getBalances()
}

const evmChains = Object.fromEntries(
  Object.entries(EVM_CHAINS).map(([chain, chainId]) => [
    chain,
    { tvl: evmTvl(chainId) },
  ])
)

module.exports = {
  methodology:
    'Tokens backed by collateral held onchain are counted as the balance of that collateral, held by the token contract itself. Real world assets held offchain are counted as the total supply of each token onchain multiplied by its unit price.',
  stellar: { tvl: stellarTvl },
  ...evmChains,
}
