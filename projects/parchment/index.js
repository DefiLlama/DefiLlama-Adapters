const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const sui = require('../helper/chain/sui')

// Parchment perps (https://parchment.trade). Contracts: https://docs.parchment.trade/contracts
// Core `parchment` package that defines `Exchange` and `extended_field::VersionKey`.
const PARCHMENT_CORE = '0xb4d5d077a8997f8dcbfefe36dd61ec8f26dfa0f789ba83e81e55252fd30eb3a2'
// The single USDC Exchange (shared). Its state, including the one vault `Balance<USDC>` that holds every
// trader deposit, open-position margin, queued payout and the house pool, is the `ExchangeStateV1` child object
// stored under the dynamic object field `VersionKey(exchange.version)`.
const EXCHANGE = '0xbe3c5d2d066c8ec04b4f280fab7c560f78deff91c7abcbdb38a750b797c29c82'

async function tvl(api) {
  const exchange = await sui.getObject(EXCHANGE)
  const versionKey = Buffer.alloc(8)
  versionKey.writeBigUInt64LE(BigInt(exchange.fields.version)) // BCS of `VersionKey(u64)` is the bare u64
  const state = await sdk.chains.sui.getDynamicFieldObject({
    chain: 'sui',
    parent: EXCHANGE,
    nameType: `${PARCHMENT_CORE}::extended_field::VersionKey`,
    nameBcs: versionKey.toString('base64'),
  })
  if (!state?.type?.includes('::exchange::ExchangeStateV1<')) throw new Error('Parchment: Exchange state not found')
  const f = state.fields
  const amount = (v) => BigInt(v?.fields?.value ?? v?.value ?? v)
  // The vault also holds fees already earned but not yet withdrawn (treasury, staker and growth buckets);
  // those belong to the protocol, not to users or the pool, so they are left out.
  const protocolFees = ['fee_lp', 'fee_staker', 'fee_growth', 'fee_dev'].reduce((sum, k) => sum + amount(f[k]), 0n)
  api.add(ADDRESSES.sui.USDC_CIRCLE, (amount(f.vault) - protocolFees).toString())
}

module.exports = {
  timetravel: false,
  methodology: 'USDC held in the Parchment Exchange vault: trader free balances, margin of open positions, queued payouts and the house pool that is every trade\'s counterparty. Trading fees earned by the protocol and stakers that still sit in the vault are excluded. Trading volume is high relative to TVL because markets allow 100x-1000x leverage on small margins, and positions are short-lived.',
  sui: { tvl },
}
