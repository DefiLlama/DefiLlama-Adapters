const { getLogs2 } = require('../helper/cache/getLogs')

const core = '0xebe7b6C1089D9F72aD07f34E36d898e44E5e27f3'
const fromBlock = 15317264

const tokenCreatedEvent = 'event TokenCreated(uint256 requestId, uint256 indexed presetId, address indexed creator, address indexed token, string name, string symbol, uint256 maxSupply, uint256 saleAmount, uint256 raiseAmount, uint256 initialPrice, address quoteAsset, address vault, address curveModule, address tradeModule, address migrateModule, address customData, address tokenModule, string tokenMetaUri, uint256 flags, bytes encodedTags)'

async function tvl(api) {
  const tokensAndOwners = await getLogs2({
    api,
    target: core,
    fromBlock,
    eventAbi: tokenCreatedEvent,
    extraKey: 'token-created',
    transform: log => [log.quoteAsset, log.vault],
  })

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  start: '2026-10-01',
  methodology: 'Counts quote collateral held in Thumb launch vaults. Excludes minted launch-token inventory, fee recipients, treasury balances, and liquidity migrated to external DEX pools.',
  anubi: { tvl },
}
