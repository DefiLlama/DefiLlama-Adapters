const { getObjectsByType, parseStructTag } = require('../helper/chain/sui')

// Original package IDs identify these Move object types across upgrades.
const LAUNCH = '0x9c2cef371c0e80648136f7ae65378ac9476e3fdb860538d00290e6e4f975b192::launch::Launch'
const PRESALE = '0x1f44a8e9fab4380228fe9c1bcc27d99b7f6ea76a8e18b5c178ca18cd46fb33c4::blast_presale::Presale'

async function tvl(api) {
  const [launches, presales] = await Promise.all([getObjectsByType(LAUNCH), getObjectsByType(PRESALE)])

  for (const { type, fields } of launches) {
    const [, quote] = parseStructTag(type).typeParams
    const balance = BigInt(fields.real_quote_reserve) + BigInt(fields.opening_round_quote)
    if (balance > 0n) api.add(quote, balance.toString())
  }

  for (const { type, fields } of presales) {
    const [, quote] = parseStructTag(type).typeParams
    const balance = BigInt(fields.quote)
    if (balance > 0n) api.add(quote, balance.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the on-chain quote assets in Blast bonding curves and opening-round escrow, plus presale quote escrow, including refunds until paid. Virtual reserves, launched-token inventory, fee ledgers, treasury balances and liquidity migrated to external DEXs are excluded.',
  sui: { tvl },
}
