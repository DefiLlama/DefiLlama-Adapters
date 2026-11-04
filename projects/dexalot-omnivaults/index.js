const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const { ethers } = require('ethers')

const dexalotAPI = 'https://api.dexalot.com'
const OMNIVAULT_MANAGER = '0x7AAC6aa9345a436D459316D8Dd1275b78DBbA3F3'
const PORTFOLIO_SUB = '0xa5C079C1986E2335d83fA2d7282e162958e515D5'
const VAULT_DETAILS_ABI =
  'function getVaultDetails(uint256 _vaultId) view returns (tuple(string name, address proposer, address omniTrader, uint8 status, address executor, address shareToken, address dexalotRFQ, uint32[] chainIds, uint16[] tokens))'

// [chain]: [chain id, Dexalot env]
const supportedChains = {
  arbitrum: [42161, 'production-multi-arb'],
  avax: [43114, 'production-multi-avax'],
  base: [8453, 'production-multi-base'],
  bsc: [56, 'production-multi-bsc'],
}

const getTokens = () => getConfig('dexalot/tokens', `${dexalotAPI}/privapi/trading/tokens`)
const getCoingeckoIds = () => getConfig('dexalot-omnivaults/coingeckoids', `${dexalotAPI}/api/stats/coingeckoids`)

// Vaults from the OmniVaultManager on the Dexalot chain. A vault's executor and DexalotRFQ have the same address on
// every chain it runs on
async function getVaults(api) {
  let dexalotApi = api
  if (api.chain !== 'dexalot') {
    dexalotApi = new sdk.ChainApi({ chain: 'dexalot', timestamp: api.timestamp })
    await dexalotApi.getBlock()
  }
  const count = await dexalotApi.call({ target: OMNIVAULT_MANAGER, abi: 'uint256:vaultIndex' })
  const vaults = await dexalotApi.multiCall({ target: OMNIVAULT_MANAGER, abi: VAULT_DETAILS_ABI, calls: [...Array(Number(count)).keys()] })
  // status 0 is an unused id, paused and deprecated vaults can still hold funds
  return vaults.filter((v) => Number(v.status) !== 0)
}

// Mainnets: each vault holds its inventory in its DexalotRFQ contract, deposits land on its executor
function mainnetTvl(chainId, env) {
  return async (api) => {
    const [vaults, tokens] = await Promise.all([getVaults(api), getTokens()])
    const owners = vaults.filter((v) => v.chainIds.map(Number).includes(chainId)).flatMap((v) => [v.executor, v.dexalotRFQ])
    const tokenAddresses = tokens.filter((t) => t.env === env).map((t) => t.address)
    return sumTokens2({ api, owners, tokens: [ADDRESSES.null, ...tokenAddresses], permitFailure: true })
  }
}

// Dexalot L1: the executors' PortfolioSub balances, including funds in open orders
async function dexalotTvl(api) {
  const [vaults, tokens, coingeckoIds] = await Promise.all([getVaults(api), getTokens(), getCoingeckoIds()])
  const executors = vaults.map((v) => v.executor)
  const balances = await api.multiCall({
    target: PORTFOLIO_SUB,
    abi: 'function getBalances(address _owner, uint256 _pageNo) view returns (bytes32[] symbols, uint256[] total, uint256[] available)',
    calls: executors.map((executor) => ({ params: [executor, 0] })),
  })
  const decimalsBySymbol = Object.fromEntries(tokens.map((t) => [t.subnet_symbol, t.l1_decimals]))
  const cgIdBySymbol = Object.fromEntries(coingeckoIds.map((c) => [c.symbol, c.coingecko_id]))

  for (const { symbols, total } of balances) {
    symbols.forEach((s, i) => {
      const symbol = ethers.decodeBytes32String(s)
      const cgId = cgIdBySymbol[symbol]
      if (!cgId || decimalsBySymbol[symbol] === undefined) return
      api.addCGToken(cgId, Number(total[i]) / 10 ** decimalsBySymbol[symbol])
    })
  }
}

module.exports = {
  methodology: 'TVL is the token balances held by the Dexalot OmniVaults: the vaults\' DexalotRFQ contracts and executors on each mainnet, and the executors\' portfolio balances on the Dexalot chain. Vault funds in open orders on the Dexalot chain are also counted in Dexalot DEX TVL.',
  dexalot: { tvl: dexalotTvl },
}

for (const [chain, [chainId, env]] of Object.entries(supportedChains)) {
  module.exports[chain] = { tvl: mainnetTvl(chainId, env) }
}
