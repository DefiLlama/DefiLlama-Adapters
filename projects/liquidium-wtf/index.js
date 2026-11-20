const { get } = require('../helper/http')

const TVL_API = 'https://app.liquidium.wtf/api/defi-llama/tvl'
const SATS_PER_BTC = 1e8

async function getBtcTotals() {
  const data = await get(TVL_API)
  if (data?.success !== true || data.asset !== 'BTC' || data.decimals !== 8)
    throw new Error('Unexpected Liquidium.WTF TVL response')
  return data
}

async function tvl(api) {
  const { instantLiquidity, collateralValue } = await getBtcTotals()
  api.addCGToken('bitcoin', Number(BigInt(instantLiquidity) + BigInt(collateralValue)) / SATS_PER_BTC)
}

async function borrowed(api) {
  const { outstandingPrincipal } = await getBtcTotals()
  api.addCGToken('bitcoin', Number(BigInt(outstandingPrincipal)) / SATS_PER_BTC)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL is the BTC lenders hold in Liquidium.WTF vaults behind live instant-loan offers, plus the collateral (Ordinals and Runes) held in escrow for open loans, valued at collection floor price in BTC; collateral without a fresh floor price, and BRC-20 collateral, is valued at the loan principal. Borrowed is the BTC principal still owed on open loans. Data comes from the Liquidium.WTF API, which reads vault balances hourly from the Bitcoin chain.',
  bitcoin: { tvl, borrowed },
}
