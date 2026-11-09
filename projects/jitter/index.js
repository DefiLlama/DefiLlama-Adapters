const sui = require('../helper/chain/sui')
const { normalizeCoinType } = require('@defillama/sdk').chains.sui

// Original type IDs survive package upgrades; discover all live market vaults.
const SCALLOP_VAULT = '0xe77999674332f5bd078c8d7182002f7bbf7844591f4d36dbfd1182b25ae071c0::scallop_market_vault::ScallopMarketVault'
const HAEDAL_VAULT = '0x4e4f6a5ee9504840a1bd5a9db589782fa44d6d1ce6f4fe45e93c6b664e161ca3::haedal_market_vault::HaedalMarketVault'
const EMBER_VAULT = '0xc56a55893f4791d03726f9c109725765b584c06eb5625704ce782112d763ef99::ember_market_vault::EmberMarketVault'
const HASUI = '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI'

async function tvl(api) {
  const scallopVaults = await sui.getObjectsByType(SCALLOP_VAULT)
  const haedalVaults = await sui.getObjectsByType(HAEDAL_VAULT)
  const emberVaults = await sui.getObjectsByType(EMBER_VAULT)
  const markets = new Map()
  const sheets = new Map()

  for (const { type, fields } of scallopVaults) {
    const balance = BigInt(fields.market_coin_balance)
    if (balance === 0n) continue
    const [underlying] = sui.parseStructTag(type).typeParams
    const marketId = fields.scallop_market_id
    if (!markets.has(marketId)) markets.set(marketId, await sui.getObject(marketId))
    const tableId = markets.get(marketId).fields.vault.fields.balance_sheets.fields.table.fields.id.id
    const coinName = normalizeCoinType(underlying).slice(2)
    const key = `${tableId}:${coinName}`
    if (!sheets.has(key)) {
      const sheet = await sui.getDynamicFieldObject(tableId, coinName, { idType: '0x1::type_name::TypeName' })
      if (!sheet) throw new Error(`Missing Scallop balance sheet: ${underlying}`)
      sheets.set(key, sheet.fields.value.fields)
    }
    const sheet = sheets.get(key)
    const netAssets = BigInt(sheet.cash) + BigInt(sheet.debt) - BigInt(sheet.revenue)
    const supply = BigInt(sheet.market_coin_supply)
    if (netAssets < 0n || supply <= 0n) throw new Error(`Invalid Scallop balance sheet: ${underlying}`)
    api.add(underlying, (balance * netAssets / supply).toString())
  }

  // Queued withdrawals remain in these balances until paid; do not add the queue again.
  for (const { fields } of haedalVaults) api.add(HASUI, fields.receipt_balance)
  for (const { type, fields } of emberVaults) {
    const [, receipt] = sui.parseStructTag(type).typeParams
    api.add(receipt, fields.receipt_balance)
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'Counts the receipt assets held in Jitter market vaults, including pending withdrawals until paid. Scallop MarketCoin shares are converted using on-chain (cash + debt - revenue) / market_coin_supply. Haedal and Ember receipts are priced as their own tokens. SY, PT, YT, LP and treasury assets are not added separately. The backing assets overlap with Scallop, Haedal and Ember Protocol TVL.',
  sui: { tvl },
}
