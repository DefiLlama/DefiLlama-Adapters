const ADDRESSES = require('../helper/coreAssets.json')
const { getTokenSupplies } = require('../helper/solana')
const { get } = require('../helper/http')

// https://explorer.solana.com/address/BwB3tNH92jKw6naNGDYDbDwRo8bvYxZVvZjRZRcoWR2h
const OTFY_MINT = 'BwB3tNH92jKw6naNGDYDbDwRo8bvYxZVvZjRZRcoWR2h'
const OTFY_DECIMALS = 9

// oTFY isn't priced by DefiLlama, so its NAV is applied here and reported as USDC.
const USDC = ADDRESSES.solana.USDC
const USDC_DECIMALS = 6

// Public, unauthenticated NAV feed for the oTFY eTracker, keyed by its stable token id.
const NAV_API =
  'https://api.obligate.com/platform/etracker/token/3cef0789-88b8-4374-b818-73f9fed942af'

async function tvl(api) {
  const otfy = await get(NAV_API)
  if (!otfy || otfy.symbol !== 'oTFY') throw new Error('Unexpected Obligate eTracker API response for oTFY')

  // Fail loudly if the eTracker is reissued, rather than misreporting TVL.
  if (otfy.contract !== OTFY_MINT)
    throw new Error(`oTFY mint changed: API reports ${otfy.contract}, adapter uses ${OTFY_MINT}`)
  if (Number(otfy.decimals) !== OTFY_DECIMALS)
    throw new Error(`oTFY decimals changed: API reports ${otfy.decimals}, adapter uses ${OTFY_DECIMALS}`)

  const nav = Number(otfy.valuation) // USDC per token, treated 1:1 with USD
  if (!nav) throw new Error(`Invalid oTFY NAV from Obligate API: ${otfy.valuation}`)

  const supplies = await getTokenSupplies([OTFY_MINT])
  const rawSupply = supplies[OTFY_MINT]
  if (rawSupply === undefined) throw new Error(`Failed to read oTFY mint supply: ${OTFY_MINT}`)
  const supply = Number(rawSupply) / 10 ** OTFY_DECIMALS

  api.add(USDC, Math.round(supply * nav * 10 ** USDC_DECIMALS))
}

module.exports = {
  methodology:
    'TVL is the total oTFY supply read on-chain from its Solana mint, multiplied by the latest per-token NAV published by Obligate (USDC-denominated), then reported in USDC.',
  misrepresentedTokens: true, // oTFY value is reported under USDC's mint
  timetravel: false, // the NAV feed only exposes the current valuation
  solana: { tvl },
}
