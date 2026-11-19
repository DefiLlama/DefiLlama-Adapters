const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')

// OracleCoordinator v3 — ERC1967 UUPS proxy; address is permanent across upgrades.
// Holds escrowed request fees + accrued (unwithdrawn) protocol fees.
const COORDINATOR = '0x9A39fc7A9385F820CC9820E291519762DA0720a3'
// Superseded v1 coordinator — empty today, but its escrow balance matters for
// historical refills before the v3 cutover.
const COORDINATOR_V1 = '0x8f487264E1B183F588CAc678D000754D3bd9B07E'
// OperatorRegistry — ERC1967 UUPS proxy. Holds operator stake bonds
// (slashable on fraudulent fulfillment).
const OPERATOR_REGISTRY = '0xfC059C84744843B1651bfa414D5500c0dF8Ca9D1'

// Balances are native BOT, but bot:0x0000...0000 has no price feed; WBOT is
// priced and 1:1 by construction, so we denominate in it (same convention as
// dexlaunch's wnative on this chain).
async function tvl(api) {
  const { output: bals } = await sdk.api.eth.getBalances({ targets: [COORDINATOR_V1, COORDINATOR, OPERATOR_REGISTRY], chain: 'bot', block: await api.getBlock() })
  bals.forEach(({ balance }) => api.add(ADDRESSES.bot.WBOT, balance))
}

module.exports = {
  methodology:
    'TVL counts native BOT held by OracleCoordinator (fees escrowed while requests are in flight plus accrued protocol fees pending treasury withdrawal) and BOT bonds operators post to OperatorRegistry, which secure fulfillments and are slashable on fraud. Native BOT balances are reported as WBOT (1:1 wrapped native).',
  start: '2026-10-05', // first fulfilled request on mainnet (block 25665263)
  bot: { tvl },
}
