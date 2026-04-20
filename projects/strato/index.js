const axios = require('axios')

const RPC_URL = 'https://noderpc.strato.nexus/rpc'
const TVL_ENDPOINT = 'https://app.strato.nexus/api/metrics/tvl'

// STRATO is not yet in @defillama/sdk's providers.json; fall back to this RPC
// unless the DefiLlama runner has already set STRATO_RPC in its environment.
if (!process.env.STRATO_RPC) process.env.STRATO_RPC = RPC_URL

// STRATO-issued tokens aren't listed on CoinGecko. We map them to the underlying
// asset's CG id so DefiLlama can price them; tokens without a mapping (USDST,
// SILVST, GOLDST) are priced via the protocol oracle's USD quote.
const CG_TOKEN_MAP = {
  ETH: 'ethereum',
  WBTC: 'wrapped-bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  wstETH: 'wrapped-steth',
  rETH: 'rocket-pool-eth',
  PAXG: 'pax-gold',
  XAUt: 'tether-gold',
  sUSDS: 'susds',
  syrupUSDC: 'syrupusdc',
}

const WAD = 10n ** 18n

const normalize = (addr) => (addr || '').toLowerCase().replace(/^0x/, '')

const splitSourceKey = (sourceKey) => {
  if (!sourceKey) return [null, null]
  const [a, b] = sourceKey.split(':')
  if (a && b) return [normalize(a), normalize(b)]
  return [null, normalize(a)]
}

async function tvl(api) {
  const { data } = await axios.get(TVL_ENDPOINT, { timeout: 15_000 })
  const positions = Array.isArray(data?.positions) ? data.positions : []

  // Pool positions carry a concrete holder address — re-verify their balances
  // via eth_call. Aggregated buckets (CDP, lending, saveUsdst, safetyModule,
  // vaults) only expose the asset key, so we use the metrics amount directly.
  const verifiable = positions
    .map((pos, i) => {
      const [holder, sourceToken] = splitSourceKey(pos.sourceKey)
      const token = normalize(pos.address)
      if (!token || !holder || !sourceToken || holder === token) return null
      return { index: i, holder, token }
    })
    .filter(Boolean)

  const results = await Promise.allSettled(
    verifiable.map(({ holder, token }) =>
      api.call({ target: token, abi: 'erc20:balanceOf', params: holder })
    )
  )

  const onchainByIndex = new Map()
  for (let k = 0; k < verifiable.length; k++) {
    const result = results[k]
    if (result.status === 'fulfilled' && result.value != null) {
      onchainByIndex.set(verifiable[k].index, BigInt(result.value))
    }
  }

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    const amount = onchainByIndex.has(i) ? onchainByIndex.get(i) : BigInt(pos.amount || '0')
    addPriced(api, pos, amount)
  }
}

function addPriced(api, position, amount) {
  if (amount === 0n) return
  const decimals = Number(position.decimals ?? 18)
  const scale = 10n ** BigInt(decimals)
  const symbol = position.symbol
  const humanAmount = Number(amount) / Number(scale)
  const cgId = CG_TOKEN_MAP[symbol]

  if (cgId) {
    api.addCGToken(cgId, humanAmount)
    return
  }

  const priceUsd = BigInt(position.priceUsd || '0')
  if (priceUsd === 0n) return
  const usdWei = (amount * priceUsd) / scale
  api.addUSDValue(Number(usdWei) / Number(WAD))
}

module.exports = {
  methodology:
    'Counts underlying assets locked in STRATO DeFi contracts across CDP, lending, pools, saveUSDST, safety module, and vaults. Pool balances are re-verified on-chain via eth_call against the STRATO JSON-RPC; aggregated buckets fall back to the protocol metrics snapshot. Excludes wallet balances, receipt/share tokens, protocol debt, and double counting.',
  misrepresentedTokens: true,
  timetravel: false,
  start: 1775151906,
  strato: { tvl },
}
