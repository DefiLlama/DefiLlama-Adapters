// projects/zealousswap/index.js
const sdk = require('@defillama/sdk')

const CHAIN   = 'kasplex'
const FACTORY = '0x98Bb580A77eE329796a79aBd05c6D2F2b3D5E1bD'
const WKAS    = '0x2c2Ae87Ba178F48637acAe54B87c3924F544a83e'.toLowerCase()

// Standard UniV2 ABIs we need
const abi = {
  allPairsLength: 'function allPairsLength() view returns (uint256)',
  allPairs:       'function allPairs(uint256) view returns (address)',
  token0:         'function token0() view returns (address)',
  token1:         'function token1() view returns (address)',
  getReserves:    'function getReserves() view returns (uint112,uint112,uint32)',
}

async function tvl(_, _b, _cb, { api }) {
  // 1) Read # of pairs
  const pairsLen = await api.call({ target: FACTORY, abi: abi.allPairsLength, chain: CHAIN })
  if (!+pairsLen) return {}

  // 2) Fetch pair addresses [0 .. pairsLen-1]
  const idx = Array.from({ length: Number(pairsLen) }, (_, i) => i)
  const pairs = await api.multiCall({
    abi: abi.allPairs, calls: idx.map(i => ({ target: FACTORY, params: [i] })), chain: CHAIN,
  })

  // 3) Fetch token0, token1, reserves for all pairs
  const [t0, t1, res] = await Promise.all([
    api.multiCall({ abi: abi.token0, calls: pairs.map(p => ({ target: p })), chain: CHAIN }),
    api.multiCall({ abi: abi.token1, calls: pairs.map(p => ({ target: p })), chain: CHAIN }),
    api.multiCall({ abi: abi.getReserves, calls: pairs.map(p => ({ target: p })), chain: CHAIN }),
  ])

  // 4) Sum TVL in KAS equivalent for pools that include WKAS
  // For a WKAS-X pool, pool TVL in KAS ≈ 2 * reserveWKAS (AMM parity).
  let kasWei = 0n
  for (let i = 0; i < pairs.length; i++) {
    const token0 = (t0[i] || '').toLowerCase()
    const token1 = (t1[i] || '').toLowerCase()
    const [r0, r1] = res[i] || ['0', '0']

    if (token0 === WKAS) {
      kasWei += 2n * BigInt(r0)  // 2 * WKAS side
    } else if (token1 === WKAS) {
      kasWei += 2n * BigInt(r1)  // 2 * WKAS side
    }
  }

  // 5) Report as whole KAS tokens (NOT wei) under coingecko:kaspa
  const DECIMALS = 18n
  const SCALE = 10n ** DECIMALS
  const kasTokens = kasWei / SCALE

  if (kasTokens > 0n) {
    sdk.util.sumSingleBalance(api.getBalances(), 'coingecko:kaspa', kasTokens.toString())
  }

  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL = sum of ZealousSwap V2 pools on Kasplex that pair against WKAS, valued via KAS (KASPA).',
  kasplex: { tvl },
}
