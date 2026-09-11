const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  base: {
    midnight: '0xAdedD8ab6dE832766Fedf0FaC4992E5C4D3EA18A',
    fromBlock: 48286884,
    blacklistedTokens: [
        // These vaults lend their underlying into Morpho Blue and post their shares as collateral to Midnight
        '0xf6a70085b7f79fa76b04ebf7a2d7d87c3c5c04bc', // Tenor cbBTC/USDC Collateral Vault
        '0xe690a58ef52854513462745237f6a213a0d54df1', // Tenor WETH/USDC Collateral Vault
        '0xfa750dd0099eadb72d401244de73ce7b89edf90f', // Tenor cbETH/WETH Collateral Vault
    ],
    blacklistedMarketIds: [],
  },
}

const marketCreatedEvent = 'event MarketCreated((uint256 chainId,address midnight,address loanToken,(address token,uint256 lltv,uint256 liquidationCursor,address oracle)[] collateralParams,uint256 maturity,uint256 rcfThreshold,address enterGate,address liquidatorGate) market,bytes32 indexed id_)'

async function getMarkets(api) {
  const { midnight, fromBlock, blacklistedMarketIds } = config[api.chain]
  const logs = await getLogs2({ api, target: midnight, eventAbi: marketCreatedEvent, fromBlock })
  const skip = new Set(blacklistedMarketIds.map(id => id.toLowerCase()))
  return logs
    .filter(log => !skip.has(log.id_.toLowerCase()))
    .map(log => ({ id: log.id_, loanToken: log.market.loanToken, collateralParams: log.market.collateralParams }))
}

async function tvl(api) {
  const { midnight, blacklistedTokens } = config[api.chain]
  const markets = await getMarkets(api)
  const tokens = markets.flatMap(m => [m.loanToken, ...m.collateralParams.map(c => c.token)])
  return sumTokens2({ api, owner: midnight, tokens, blacklistedTokens })
}

async function borrowed(api) {
  const { midnight } = config[api.chain]
  const markets = await getMarkets(api)
  const totalUnits = await api.multiCall({ abi: 'function totalUnits(bytes32) view returns (uint128)', target: midnight, calls: markets.map(m => ({ params: [m.id] })) })
  markets.forEach((market, i) => api.add(market.loanToken, totalUnits[i]))
}

module.exports = {
  methodology: 'Every Midnight market is enumerated on-chain from MarketCreated events. TVL is the collateral held in the Midnight contract. Borrowed is outstanding debt read per-market from totalUnits.',
  base: { tvl, borrowed },
}
