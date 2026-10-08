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
  methodology: 'TVL is the total on-chain quote-asset balance held in Thumb launch vaults discovered from Core TokenCreated events.',
  anubi: { tvl },
}
