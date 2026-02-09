const { getCuratorExport } = require("../helper/curators")

// ---- Minimal ABIs / constants used for Gearbox v3.1 collateral crawl ----
const DEFILLAMA_COMPRESSOR_V310 = "0x81cb9eA2d59414Ab13ec0567EFB09767Ddbe897a"

const GearboxCompressorABI = {
  // Returns credit managers linked to one or more legacy market configurators.
  getLegacyCreditManagers:
    "function getCreditManagers(address[] memory configurators) external view returns (address[] memory creditManagers)",

  // Paginated list of credit accounts for a credit manager, including debt and token balances.
  getCreditAccounts:
    "function getCreditAccounts(address creditManager, uint256 offset, uint256 limit) external view returns (tuple(address creditAccount, uint256 debt, tuple(address token, uint256 balance)[] tokens)[] memory data)",
}

// ---- Curator config ----
const configs = {
  methodology:
    "Counts (1) assets in curated ERC-4626 vaults and (2) collateral held in Gearbox v3.1 credit accounts for the configured market configurator. Morpho v1/v2 vault discovery is deduplicated to avoid double-counting.",
  blockchains: {
    ethereum: {
      // Option 1: discover Morpho vaults owned by these addresses (dynamic, event-based).
      morphoVaultOwners: [
        // Example: "0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8",
      ],

      // Option 2: provide static Morpho vault addresses.
      // You can combine morphoVaultOwners + morpho; deduplication is applied.
      morpho: [
        "0xe108fbc04852B5df72f9E44d7C29F47e7A993aDd", // Morpho v1 USDC Prime
        "0x0c6aec603d48eBf1cECc7b247a2c3DA08b398DC1", // Morpho v1 EURC Yield
        "0xd564F765F9aD3E7d2d6cA782100795a885e8e7C8", // Morpho v1 ETH Prime
        "0x4Ef53d2cAa51C447fdFEEedee8F07FD1962C9ee6", // Morpho v2 USDC Prime
        "0xa877D5bb0274dcCbA8556154A30E1Ca4021a275f", // Morpho v2 EURC Yield
        "0xbb50a5341368751024ddf33385ba8cf61fe65ff9", // Morpho v2 ETH Prime
        "0x5dbf760b4fd0cDdDe0366b33aEb338b2A6d77725", // Morpho v2 ETH Yield
        "0xc88eFFD6e74D55c78290892809955463468E982A", // Morpho v1 ETH Yield
        "0xD5cCe260E7a755DDf0Fb9cdF06443d593AaeaA13", // Morpho v2 USDC Yield
        "0x9178eBE0691593184c1D785a864B62a326cc3509", // Morpho v1 USDC Yield
      ],

      // Non-Morpho curated ERC-4626 vaults.
      erc4626: [
        "0x9396dcbf78fc526bb003665337c5e73b699571ef", // Gearbox ETH
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64", // Gearbox wstETH
      ],

      // Gearbox v3.1 legacy market configurator used for credit-account crawl.
      gearboxMarketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",

      // Force ERC-4626 unwrap for known wrappers (ERC-4626 path only).
      gearboxForceUnwrap: [
        "0x02a4cceed3c400b5ba9fd22ad6ec18d8f7a3d48e",
        "0x1a711a5bc48b5c1352c1882fa65dc14b5b9e829d",
        "0x31454faa1daa04cacf59a6bd37681da9160d092a",
      ],

      // Optional: force Beefy-style unwrap for wrappers exposing want/token + PPFS.
      gearboxForceUnwrapBeefy: [
        // "0x....",
      ],
    },

    arbitrum: {
      morpho: [
        "0x2C609d9CfC9dda2dB5C128B2a665D921ec53579d", // Morpho USDC Yield
        "0x5837e4189819637853a357aF36650902347F5e73", // Morpho USDC Yield v2
      ],
    },
  },
}

// ---- Helpers ----

const ONE_18 = 10n ** 18n
// Max recursion depth for wrapper resolution (two-hop unwrap).
const MAX_UNWRAP_DEPTH = 2

// Enable with: GEARBOX_UNWRAP_DEBUG=1 node test.js projects/kpk/index.js
const DEBUG_UNWRAP = ["1", "true", "yes"].includes(
  String(process.env.GEARBOX_UNWRAP_DEBUG || "").toLowerCase(),
)

const symbolCache = new Map()

function toBigIntSafe(v) {
  try {
    return BigInt(v)
  } catch {
    return undefined
  }
}

function toLowerSet(arr = []) {
  return new Set(arr.map((a) => String(a).toLowerCase()))
}

async function safeCall(api, params) {
  // permitFailure avoids throwing at adapter level;
  // local test.js may still print failed calls due to its debug wrapper.
  try {
    return await api.call({ ...params, permitFailure: true })
  } catch {
    return undefined
  }
}

async function getTokenSymbol(api, token) {
  const tokenLc = token.toLowerCase()
  if (symbolCache.has(tokenLc)) return symbolCache.get(tokenLc)

  // Symbol is heuristic only; do not rely on it as a hard wrapper classification.
  const symbol = await safeCall(api, {
    target: tokenLc,
    abi: "erc20:symbol",
  })

  const out = typeof symbol === "string" ? symbol : undefined
  symbolCache.set(tokenLc, out)
  return out
}

function isBeefyLikeSymbol(symbol) {
  if (!symbol) return false
  const s = symbol.toLowerCase()
  return s.includes("moo") || s.includes("beefy")
}

function createUnwrapStats(chain) {
  return {
    chain,
    uniqueTokens: 0,
    activeAccounts: 0,
    skippedDust: 0,
    probed: 0,
    force4626Hits: 0,
    forceBeefyHits: 0,
    unwrappedBeefy: 0,
    unwrapped4626: 0,
    maxDepthStops: 0,
    fallbackAsIs: 0,
    fallbackSamples: [],
  }
}

function pushFallbackSample(stats, token, balance, reason) {
  if (!DEBUG_UNWRAP) return
  if (!stats || stats.fallbackSamples.length >= 12) return
  stats.fallbackSamples.push({ token, balance: String(balance), reason })
}

function printUnwrapStats(stats) {
  if (!DEBUG_UNWRAP) return

  console.log(
    `[kpk][gearbox-unwrap][${stats.chain}] uniqueTokens=${stats.uniqueTokens} activeAccounts=${stats.activeAccounts} skippedDust=${stats.skippedDust} probed=${stats.probed} force4626Hits=${stats.force4626Hits} forceBeefyHits=${stats.forceBeefyHits} beefyUnwraps=${stats.unwrappedBeefy} erc4626Unwraps=${stats.unwrapped4626} maxDepthStops=${stats.maxDepthStops} fallbackAsIs=${stats.fallbackAsIs}`,
  )

  if (stats.fallbackSamples.length) {
    console.log(`[kpk][gearbox-unwrap][${stats.chain}] fallback samples:`)
    for (const s of stats.fallbackSamples) {
      console.log(`  - ${s.token} | reason=${s.reason} | bal=${s.balance}`)
    }
  }
}

/**
 * Try ERC-4626 unwrap:
 * shares -> assets via convertToAssets() or previewRedeem().
 * Returns { token, amount } on success, otherwise null.
 */
async function tryUnwrap4626(api, tokenLc, bal) {
  const asset = await safeCall(api, {
    target: tokenLc,
    abi: "address:asset",
  })

  if (!asset || typeof asset !== "string") return null
  const assetLc = asset.toLowerCase()
  if (assetLc === tokenLc) return null

  let assetsOut = await safeCall(api, {
    target: tokenLc,
    abi: "function convertToAssets(uint256 shares) view returns (uint256 assets)",
    params: [bal.toString()],
  })

  if (assetsOut == null) {
    assetsOut = await safeCall(api, {
      target: tokenLc,
      abi: "function previewRedeem(uint256 shares) view returns (uint256 assets)",
      params: [bal.toString()],
    })
  }

  const assetsBI = toBigIntSafe(assetsOut)
  if (!assetsBI || assetsBI <= 0n) return null

  return { token: assetLc, amount: assetsBI }
}

/**
 * Try Beefy-style unwrap:
 * shares -> underlying via want/token + pricePerShare/getPricePerFullShare.
 * Returns { token, amount } on success, otherwise null.
 */
async function tryUnwrapBeefy(api, tokenLc, bal) {
  const want =
    (await safeCall(api, { target: tokenLc, abi: "address:want" })) ||
    (await safeCall(api, { target: tokenLc, abi: "address:token" }))

  if (!want || typeof want !== "string") return null
  const wantLc = want.toLowerCase()
  if (wantLc === tokenLc) return null

  const ppfsRaw =
    (await safeCall(api, { target: tokenLc, abi: "uint256:getPricePerFullShare" })) ||
    (await safeCall(api, { target: tokenLc, abi: "uint256:pricePerShare" }))

  const ppfs = toBigIntSafe(ppfsRaw)
  if (!ppfs || ppfs <= 0n) return null

  const underlyingAmount = (bal * ppfs) / ONE_18
  if (underlyingAmount <= 0n) return null

  return { token: wantLc, amount: underlyingAmount }
}

/**
 * Recursive unwrap with capped depth (MAX_UNWRAP_DEPTH):
 * - Forced ERC-4626 tokens: ERC-4626 path only (no Beefy probes).
 * - Beefy-forced / Beefy-like tokens: Beefy first, then ERC-4626 fallback.
 * - Unknown-symbol tokens: ERC-4626 first, then Beefy.
 * - Known non-wrapper-like tokens: kept as-is.
 */
async function addResolvedTokenBalance(
  api,
  token,
  rawBalance,
  force4626Set,
  forceBeefySet,
  stats,
  depth = 0,
) {
  const bal = toBigIntSafe(rawBalance)
  if (!bal || bal <= 1n) {
    if (stats) stats.skippedDust++
    return
  }

  const tokenLc = token.toLowerCase()

  if (depth >= MAX_UNWRAP_DEPTH) {
    if (stats) stats.maxDepthStops++
    api.add(tokenLc, bal.toString())
    return
  }

  const symbol = await getTokenSymbol(api, tokenLc)
  const beefyLike = isBeefyLikeSymbol(symbol)
  const force4626 = force4626Set.has(tokenLc)
  const forceBeefy = forceBeefySet.has(tokenLc)

  if (stats && force4626) stats.force4626Hits++
  if (stats && forceBeefy) stats.forceBeefyHits++

  // Forced ERC-4626 tokens never attempt Beefy methods.
  if (force4626) {
    if (stats) stats.probed++
    const via4626 = await tryUnwrap4626(api, tokenLc, bal)
    if (via4626) {
      if (stats) stats.unwrapped4626++
      await addResolvedTokenBalance(
        api,
        via4626.token,
        via4626.amount.toString(),
        force4626Set,
        forceBeefySet,
        stats,
        depth + 1,
      )
      return
    }

    if (stats) stats.fallbackAsIs++
    pushFallbackSample(stats, tokenLc, bal, "force4626-failed")
    api.add(tokenLc, bal.toString())
    return
  }

  // Probe only likely wrappers or explicitly forced Beefy wrappers.
  const shouldProbe = forceBeefy || beefyLike || !symbol
  if (!shouldProbe) {
    if (stats) stats.fallbackAsIs++
    pushFallbackSample(stats, tokenLc, bal, "not-wrapper-likely")
    api.add(tokenLc, bal.toString())
    return
  }

  if (stats) stats.probed++

  if (forceBeefy || beefyLike) {
    const viaBeefy = await tryUnwrapBeefy(api, tokenLc, bal)
    if (viaBeefy) {
      if (stats) stats.unwrappedBeefy++
      await addResolvedTokenBalance(
        api,
        viaBeefy.token,
        viaBeefy.amount.toString(),
        force4626Set,
        forceBeefySet,
        stats,
        depth + 1,
      )
      return
    }

    const via4626 = await tryUnwrap4626(api, tokenLc, bal)
    if (via4626) {
      if (stats) stats.unwrapped4626++
      await addResolvedTokenBalance(
        api,
        via4626.token,
        via4626.amount.toString(),
        force4626Set,
        forceBeefySet,
        stats,
        depth + 1,
      )
      return
    }
  } else {
    // Unknown symbol: quieter to try ERC-4626 before Beefy.
    const via4626 = await tryUnwrap4626(api, tokenLc, bal)
    if (via4626) {
      if (stats) stats.unwrapped4626++
      await addResolvedTokenBalance(
        api,
        via4626.token,
        via4626.amount.toString(),
        force4626Set,
        forceBeefySet,
        stats,
        depth + 1,
      )
      return
    }

    const viaBeefy = await tryUnwrapBeefy(api, tokenLc, bal)
    if (viaBeefy) {
      if (stats) stats.unwrappedBeefy++
      await addResolvedTokenBalance(
        api,
        viaBeefy.token,
        viaBeefy.amount.toString(),
        force4626Set,
        forceBeefySet,
        stats,
        depth + 1,
      )
      return
    }
  }

  if (stats) stats.fallbackAsIs++
  pushFallbackSample(stats, tokenLc, bal, "probe-failed")
  api.add(tokenLc, bal.toString())
}

// ---- Gearbox v3.1 credit-account collateral TVL ----

async function getGearboxV31Collateral(
  api,
  marketConfigurator,
  forceUnwrap4626 = [],
  forceUnwrapBeefy = [],
  pageSize = 1e3,
) {
  if (!marketConfigurator) return
  const force4626Set = toLowerSet(forceUnwrap4626)
  const forceBeefySet = toLowerSet(forceUnwrapBeefy)
  const stats = createUnwrapStats(api.chain || "unknown")

  // Fetch credit managers for this configurator.
  const creditManagers = await api.call({
    abi: GearboxCompressorABI.getLegacyCreditManagers,
    target: DEFILLAMA_COMPRESSOR_V310,
    params: [[marketConfigurator]],
  })
  if (!creditManagers?.length) {
    printUnwrapStats(stats)
    return
  }

  // Aggregate balances by token first, then resolve wrappers once per token.
  const tokenTotals = {} // { [tokenLower]: bigint }

  for (const cm of creditManagers) {
    let offset = 0
    while (true) {
      const accounts = await api.call({
        abi: GearboxCompressorABI.getCreditAccounts,
        target: DEFILLAMA_COMPRESSOR_V310,
        params: [cm, offset, pageSize],
        permitFailure: true,
      })

      if (!accounts || !accounts.length) break
      offset += accounts.length

      // Keep only active credit accounts (non-zero debt).
      for (const acc of accounts) {
        if (!acc) continue
        const hasDebt = BigInt(acc.debt || 0n) !== 0n
        if (!hasDebt) continue
        stats.activeAccounts++

        for (const t of acc.tokens || []) {
          if (!t?.token || t.balance == null) continue
          const b = toBigIntSafe(t.balance)
          if (!b || b <= 1n) {
            stats.skippedDust++
            continue
          }

          const key = t.token.toLowerCase()
          tokenTotals[key] = (tokenTotals[key] || 0n) + b
        }
      }

      if (accounts.length < pageSize) break
    }
  }

  stats.uniqueTokens = Object.keys(tokenTotals).length

  // Resolve wrappers recursively up to MAX_UNWRAP_DEPTH.
  for (const [token, bal] of Object.entries(tokenTotals)) {
    await addResolvedTokenBalance(
      api,
      token,
      bal.toString(),
      force4626Set,
      forceBeefySet,
      stats,
      0,
    )
  }

  printUnwrapStats(stats)
}

// ---- Combined TVL export per chain ----

const exportObjects = getCuratorExport(configs)

// Add Gearbox collateral TVL on top of the curator-exported TVL per chain.
for (const [chain, chainCfg] of Object.entries(configs.blockchains)) {
  if (exportObjects[chain] && chainCfg.gearboxMarketConfigurator) {
    const originalTvl = exportObjects[chain].tvl
    exportObjects[chain].tvl = async (api) => {
      await originalTvl(api)
      await getGearboxV31Collateral(
        api,
        chainCfg.gearboxMarketConfigurator,
        chainCfg.gearboxForceUnwrap || [],
        chainCfg.gearboxForceUnwrapBeefy || [],
      )
    }
  }
}

module.exports = exportObjects
