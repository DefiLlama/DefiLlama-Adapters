const { sumTokens2 } = require('../helper/unwrapLPs')

/**
 * Umbrae runs two AMM designs on Base, both deployed from factories that expose
 * the same enumeration surface (`allPairsLength()` / `allPairs(uint256)`) and
 * whose pairs expose `tokenX()` / `tokenY()`:
 *
 *  - DLMM  — a Liquidity Book style discrete-bin concentrated-liquidity AMM.
 *            Two generations are live: the original factory, which is paused
 *            for trading but still open for LP withdrawals (so it still holds
 *            user funds and must be counted), and the current v2 factory.
 *  - DAMM  — a dynamic-fee constant-product AMM.
 *
 * In both designs the pair contract custodies the liquidity directly, so TVL is
 * the pair's balance of its own two tokens.
 */
// `fromBlock` is each factory's own deployment block. TVL is also computed at
// historical blocks where a later factory does not exist yet, and calling
// `allPairsLength()` on an empty address reverts, so factories are filtered by
// block before they are queried.
const factories = [
  { factory: '0x17Da44dcbdffD8c715be7A368E19F252C2940Fee', fromBlock: 43528312 }, // DLMM, original deployment (withdrawal-only)
  { factory: '0x9DBB9289d0D75508b5D8EE01FfE4eb7c412F733b', fromBlock: 50392460 }, // DLMM v2
  { factory: '0xD14322b444415d78DBBF646BB369Ec325a1aCD5c', fromBlock: 45693740 }, // DAMM v4
]

const abi = {
  allPairsLength: 'uint256:allPairsLength',
  allPairs: 'function allPairs(uint256) view returns (address)',
  tokenX: 'address:tokenX',
  tokenY: 'address:tokenY',
}

async function tvl(api) {
  const tokensAndOwners = []
  const block = await api.getBlock()

  for (const { factory, fromBlock } of factories) {
    if (block < fromBlock) continue

    const pairs = await api.fetchList({
      target: factory,
      lengthAbi: abi.allPairsLength,
      itemAbi: abi.allPairs,
    })
    const tokenX = await api.multiCall({ abi: abi.tokenX, calls: pairs })
    const tokenY = await api.multiCall({ abi: abi.tokenY, calls: pairs })

    pairs.forEach((pair, i) => {
      tokensAndOwners.push([tokenX[i], pair])
      tokensAndOwners.push([tokenY[i], pair])
    })
  }

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is the sum of both pair tokens held by every liquidity pool Umbrae has deployed on Base. Pools are enumerated on chain from the three pair factories (the original DLMM factory, which is paused for trading but still holds withdrawable LP funds; the current DLMM v2 factory; and the DAMM v4 factory) via allPairsLength()/allPairs(), and each pool contributes its own balance of tokenX and tokenY. DLMM is a Liquidity Book style discrete-bin concentrated-liquidity AMM and DAMM is a dynamic-fee constant-product AMM; in both, the pair contract custodies liquidity directly, so no LP unwrapping is required.',
  start: 1773845971, // 2026-03-18, Base block 43528312 — first DLMM factory deployment
  base: {
    tvl,
  },
}
