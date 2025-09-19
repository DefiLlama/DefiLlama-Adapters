const axios = require("axios")

const ALKIMI_DECIMALS = 9n
const ALKIMI_COINGECKO_ID = "alkimi-2"
const SUI_DECIMALS = 9n
const SUI_COINGECKO_ID = "sui"

const AMM_POOLS = [
  {
    id: "0x5cf7e2ec9311d9057e43477a29bd457c51beeb1ddcd151c385a295dbb3c0fb18",	// Cetus
    coinA: { id: ALKIMI_COINGECKO_ID, decimals: ALKIMI_DECIMALS },
    coinB: { id: SUI_COINGECKO_ID, decimals: SUI_DECIMALS },
  },
  {
    id: "0x7a1ff1044fb4141c0cccd340605472077480606d4c28c74be7ab87f4ee4852be",	//BlueFin
    coinA: { id: ALKIMI_COINGECKO_ID, decimals: ALKIMI_DECIMALS },
    coinB: { id: SUI_COINGECKO_ID, decimals: SUI_DECIMALS },
  },
  {
    id: "0x2ae42f340d32653cd079f3e80e2e6c2f9485cd8a91491bac0b47e93708c8f049",	// Turbos
    coinA: { id: ALKIMI_COINGECKO_ID, decimals: ALKIMI_DECIMALS },
    coinB: { id: SUI_COINGECKO_ID, decimals: SUI_DECIMALS },
  },
  {
    id: "0x9d37052563cccad03f794caf914f14cb0505d0782020b8a3ff97cea126791a33",	// SuiLend
    coinA: { id: ALKIMI_COINGECKO_ID, decimals: ALKIMI_DECIMALS },
    coinB: { id: SUI_COINGECKO_ID, decimals: SUI_DECIMALS },
  },
  {
    id: "0x17bac48cb12d565e5f5fdf37da71705de2bf84045fac5630c6d00138387bf46a",	// Full Sail
    coinA: { id: ALKIMI_COINGECKO_ID, decimals: ALKIMI_DECIMALS },
    coinB: { id: SUI_COINGECKO_ID, decimals: SUI_DECIMALS },
  },
]

// RPC fetcher
async function getObject(id) {
  const resp = await axios.post("https://fullnode.mainnet.sui.io:443", {
    jsonrpc: "2.0",
    id: 1,
    method: "sui_getObject",
    params: [id, { showContent: true }],
  })
  return resp.data.result?.data?.content?.fields
}

// universal reserve extractor
function getReserves(fields) {
  const possibleA = [
    "coin_a_reserve",
    "reserve_x",
    "balance_a",
    "reserve_a",
    "coin_a",
  ]
  const possibleB = [
    "coin_b_reserve",
    "reserve_y",
    "balance_b",
    "reserve_b",
    "coin_b",
  ]

  let reserveA = "0"
  let reserveB = "0"

  for (const key of possibleA) {
    if (fields[key] !== undefined) {
      reserveA = fields[key]
      break
    }
  }

  for (const key of possibleB) {
    if (fields[key] !== undefined) {
      reserveB = fields[key]
      break
    }
  }
  return { reserveA: BigInt(reserveA), reserveB: BigInt(reserveB) }
}

module.exports = async function ammPools() {
  const balances = {}
  for (const pool of AMM_POOLS) {
    const fields = await getObject(pool.id)
    if (!fields) continue

    const { reserveA, reserveB } = getReserves(fields)

    balances[pool.coinA.id] =
      (balances[pool.coinA.id] || 0) +
      Number(reserveA / 10n ** pool.coinA.decimals)

    balances[pool.coinB.id] =
      (balances[pool.coinB.id] || 0) +
      Number(reserveB / 10n ** pool.coinB.decimals)
  }
  return balances
}
