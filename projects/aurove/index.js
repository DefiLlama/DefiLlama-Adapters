const ADDRESSES = require('../helper/coreAssets.json')

// Aurove AssetLedger (ERC-1155) — canonical claim supply for managed products
const LEDGER = '0x0AF3601f0E15b8E33fEc660fBE515DDb6C54dD3c'

// Aurove asset CL pools (token order by address sort)
// MUSD/avBTCm:   token0=MUSD,    token1=avBTCm
const POOL_MUSD_AVBTCM = '0xB018BED3b3376cE95ee34db170348FA16d18e29D'
// avBTCm/avMEZOm: token0=avMEZOm, token1=avBTCm
const POOL_AVBTCM_AVMEZOM = '0xE639b9B1fb72C8ea2Fea246Ba0ad0ed7ddfB0E1C'

// Production managed-tranche ids: (variant << 16) | epochs
// veBTC managed sentinel: variant=1, epochs=4 → 65540
// veMEZO managed sentinel: variant=2, epochs=208 → 131280
const AVBTCM_TRANCHE_ID = 65540
const AVMEZOM_TRANCHE_ID = 131280

const slot0Abi = 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)'

const Q96 = 2n ** 96n
const Q192 = Q96 * Q96

/**
 * UniV3: price_token1_per_token0 = (sqrtPriceX96 / 2^96)^2
 * Convert `amount1` of token1 into token0 units.
 */
function token1ToToken0(amount1, sqrtPriceX96) {
  const sp = BigInt(sqrtPriceX96)
  if (sp === 0n) return 0n
  return (BigInt(amount1) * Q192) / (sp * sp)
}

/**
 * Convert `amount0` of token0 into token1 units.
 */
function token0ToToken1(amount0, sqrtPriceX96) {
  const sp = BigInt(sqrtPriceX96)
  if (sp === 0n) return 0n
  return (BigInt(amount0) * sp * sp) / Q192
}

async function tvl(api) {
  const [avbtcmSupply, avmezomSupply, musdAvbtcmSlot0, avmezomAvbtcmSlot0] = await Promise.all([
    api.call({
      abi: 'function totalSupply(uint256) view returns (uint256)',
      target: LEDGER,
      params: [AVBTCM_TRANCHE_ID],
    }),
    api.call({
      abi: 'function totalSupply(uint256) view returns (uint256)',
      target: LEDGER,
      params: [AVMEZOM_TRANCHE_ID],
    }),
    api.call({ abi: slot0Abi, target: POOL_MUSD_AVBTCM }),
    api.call({ abi: slot0Abi, target: POOL_AVBTCM_AVMEZOM }),
  ])

  const musdSqrt = musdAvbtcmSlot0.sqrtPriceX96 ?? musdAvbtcmSlot0[0]
  const mezSqrt = avmezomAvbtcmSlot0.sqrtPriceX96 ?? avmezomAvbtcmSlot0[0]

  // avBTCm → MUSD (token1 → token0 on MUSD/avBTCm)
  const musdFromAvbtcm = token1ToToken0(avbtcmSupply, musdSqrt)

  // avMEZOm → avBTCm (token0 → token1 on avBTCm/avMEZOm) → MUSD
  const avbtcmFromAvmezom = token0ToToken1(avmezomSupply, mezSqrt)
  const musdFromAvmezom = token1ToToken0(avbtcmFromAvmezom, musdSqrt)

  // Book as MUSD so DefiLlama prices via the already-listed Mezo MUSD feed.
  // Quantity is still Ledger managed supply; USD uses Id20 pool mids (off-peg OK).
  api.add(ADDRESSES.mezo.MUSD, musdFromAvbtcm + musdFromAvmezom)
}

module.exports = {
  methodology:
    'TVL counts Aurove Ledger ERC-1155 totalSupply for managed avBTCm (tranche 65540) and avMEZOm (tranche 131280). Shares mint 1:1 with locked underlying, but USD valuation uses Id20 market prices from Aurove CL pools (MUSD/avBTCm and avBTCm/avMEZOm), converted to MUSD — not BTC/MEZO spot pegs — because the wrappers trade off-peg. Marked doublecounted because the same underlying locks are already in Mezo Earn (veBTC/veMEZO). Concentrated-liquidity pool balances stay under Tigris Mezo V3, not here.',
  doublecounted: true,
  mezo: { tvl },
}
