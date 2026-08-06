const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')

const LBTCV = '0x5401b8620E5FB570064CA9114fd1e135fd77D57c'       // vault (ETH/Base/BSC)
const SONIC_VAULT = '0x309f25d839a2fe225e80210e110C99150Db98AAF'  // vault (Sonic)

const LBTC = ADDRESSES.etlk.LBTC

// ── Add new BoringVault tokens here ──────────────────────────────────────────
// Unwrapped to underlying base asset in tvlEthExtras.
// `asset` optionally overrides the accountant base asset (same price magnitude,
// used when the vault reports a different-but-equivalent BTC unit of account).
const BORING_VAULTS_ETH = [
  { token: '0x75231079973c23e9eb6180fa3d2fc21334565ab5' },                                 // Turtle Club (katanaLBTCv) -> accountant base
  // Sentora Lombard Vault (sLBTC): LBTC deposits are deployed into a SupervisedLoanPositionManager
  // (0x6cad5fcb29d98c4968a79ea7db286c5986389009) that currently holds the backing as LBTC.
  // The accountant's base asset is WBTC (pricing unit only), so count the position as LBTC.
  { token: '0x13cc1b39cb259ba10cd174eae42012e698ed7c51', asset: ADDRESSES.ethereum.LBTC },
]

// ── Add new pricePerShare vault tokens here ───────────────────────────────────
// ERC4626-style shares valued as asset() * pricePerShare(); unwrapped in tvlEthExtras.
const PPS_VAULTS_ETH = [
  '0xf14f678d9c05798ba61652a950a05d74ad2e0a6c',  // Bitcoin Onchain Credit Strategy (BTCoc) -> BTC.b
]

// ── Add new Curve pools here ──────────────────────────────────────────────────
const CURVE_POOLS_ETH = [
  { pool: '0x2f3bc4c27a4437aeca13de0e37cdf1028f3706f0', coinCount: 2 },
  { pool: '0xa7741d3d29a4391a7ca671d00e444342b6a8ad5a', coinCount: 2 },
]
const CURVE_POOLS_CORN = [
  { pool: '0xAB3291b73a1087265E126E330cEDe0cFd4B8A693', coinCount: 2 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Unwraps a single Curve StableSwap-NG pool LP share held by `holder`.
// Works for both eth (where base scanner already discovered the LP token) and
// chains without auto-discovery (Corn): removeTokenBalance is a no-op when the
// token isn't in balances yet.
async function unwrapCurvePoolShare({ api, pool, holder, coinCount }) {
  const lpBalance = await api.call({
    target: pool, abi: 'erc20:balanceOf', params: [holder], permitFailure: true,
  })
  if (!lpBalance || lpBalance === '0') return

  const totalSupply = await api.call({
    target: pool, abi: 'erc20:totalSupply', permitFailure: true,
  })
  if (!totalSupply || totalSupply === '0') return

  api.removeTokenBalance(pool)  // no-op if not present

  const lpBI = BigInt(lpBalance)
  const supplyBI = BigInt(totalSupply)

  for (let i = 0; i < coinCount; i++) {
    const token = await api.call({
      target: pool, abi: 'function coins(uint256) view returns (address)',
      params: [i], permitFailure: true,
    })
    if (!token || token.toLowerCase() === ADDRESSES.null.toLowerCase()) break

    const poolBal = await api.call({
      target: pool, abi: 'function balances(uint256) view returns (uint256)',
      params: [i], permitFailure: true,
    })
    if (!poolBal) continue

    const amount = BigInt(poolBal) * lpBI / supplyBI
    if (amount > 0n) api.add(token, amount)
  }
}

// Unwraps a BoringVault share token to its underlying base asset via the
// Vault → Hook → Accountant → (base, rate) architecture.
// `assetOverride` replaces the accountant base asset when set (equivalent BTC unit).
async function unwrapBoringVault(api, vaultToken, holder, assetOverride) {
  const shareBalance = await api.call({
    target: vaultToken, abi: 'erc20:balanceOf', params: [holder], permitFailure: true,
  })
  if (!shareBalance || shareBalance === '0') return

  const hook = await api.call({ target: vaultToken, abi: 'address:hook', permitFailure: true })
  if (!hook) return

  const accountant = await api.call({ target: hook, abi: 'address:accountant', permitFailure: true })
  if (!accountant) return

  const [baseAsset, rate, decimals] = await Promise.all([
    api.call({ target: accountant, abi: 'address:base', permitFailure: true }),
    api.call({ target: accountant, abi: 'uint256:getRate', permitFailure: true }),
    api.call({ target: accountant, abi: 'uint8:decimals', permitFailure: true }),
  ])
  if (!baseAsset || !rate || decimals === undefined || decimals === null) return

  const decimalsBI = BigInt(decimals)
  const scale = 10n ** decimalsBI
  if (scale === 0n) return

  const amount = BigInt(shareBalance) * BigInt(rate) / scale
  if (amount <= 0n) return
  api.add(assetOverride || baseAsset, amount)
}

// Unwraps an ERC4626-style share token via asset() * pricePerShare().
async function unwrapPpsVault(api, vaultToken, holder) {
  // No permitFailure: these are hardcoded vaults, so a failing read means the
  // config broke. Failing loudly keeps the last known-good TVL instead of
  // silently dropping the whole position.
  const shareBalance = await api.call({
    target: vaultToken, abi: 'erc20:balanceOf', params: [holder],
  })
  if (!shareBalance || shareBalance === '0') return

  const [asset, pricePerShare, decimals] = await Promise.all([
    api.call({ target: vaultToken, abi: 'address:asset' }),
    api.call({ target: vaultToken, abi: 'function pricePerShare() view returns (uint256)' }),
    api.call({ target: vaultToken, abi: 'erc20:decimals' }),
  ])

  const scale = 10n ** BigInt(decimals)
  if (scale === 0n) return

  // pricePerShare is asset units per one whole share (10^decimals shares)
  const amount = BigInt(shareBalance) * BigInt(pricePerShare) / scale
  if (amount <= 0n) return
  api.add(asset, amount)
}

// ─── Per-chain extra TVL hooks ────────────────────────────────────────────────

async function tvlEthExtras(api) {
  // 1. Unwrap Curve LP pools (add new pools to CURVE_POOLS_ETH above)
  for (const { pool, coinCount } of CURVE_POOLS_ETH) {
    await unwrapCurvePoolShare({ api, pool, holder: LBTCV, coinCount })
  }

  // 2. Unwrap BoringVault shares (add new vaults to BORING_VAULTS_ETH above)
  for (const { token, asset } of BORING_VAULTS_ETH) {
    await unwrapBoringVault(api, token, LBTCV, asset)
  }

  // 3. Unwrap pricePerShare vault shares (add new vaults to PPS_VAULTS_ETH above)
  for (const vault of PPS_VAULTS_ETH) {
    await unwrapPpsVault(api, vault, LBTCV)
  }

  await sumTokens2({ api, owner: LBTCV, resolveUniV4: true, })
}

async function tvlCornExtras(api) {
  // Curve pools on Corn (add new pools to CURVE_POOLS_CORN above)
  for (const { pool, coinCount } of CURVE_POOLS_CORN) {
    await unwrapCurvePoolShare({ api, pool, holder: LBTCV, coinCount })
  }
}

// ─── Composer ─────────────────────────────────────────────────────────────────

function composeChainTVL(baseScanner, additionalFns = []) {
  return async (api) => {
    if (baseScanner) await baseScanner(api)
    for (const fn of additionalFns) await fn(api)
    return api.getBalances()
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  doublecounted: true,

  ethereum: {
    tvl: composeChainTVL(
      sumTokensExport({
        owners: [LBTCV],
        tokens: [ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.LBTC, ADDRESSES.ethereum.cbBTC],
        resolveUniV3: true,
      }),
      [tvlEthExtras]
    ),
  },

  base: {
    tvl: sumTokensExport({
      owners: [LBTCV],
      tokens: [ADDRESSES.base.cbBTC, LBTC],
      resolveUniV3: true,
      resolveSlipstream: true,
    }),
  },

  bsc: {
    tvl: sumTokensExport({
      owners: [LBTCV],
      tokens: [ADDRESSES.bsc.BTCB, LBTC],
      resolveUniV3: true,
    }),
  },

  corn: {
    tvl: composeChainTVL(
      sumTokensExport({
        owners: [LBTCV],
        tokens: [
          ADDRESSES.ethereum.BTCN, // BTCN on Corn
          ADDRESSES.corn.wBTCN, // wBTCN (Wrapped BTCN)
          ADDRESSES.corn.LBTC, // LBTC on Corn
        ],
      }),
      [tvlCornExtras]
    ),
  },

  sonic: {
    tvl: sumTokensExport({ owners: [SONIC_VAULT], tokens: [ADDRESSES.sonic.LBTC] }),
  },

  methodology: 'TVL = assets in vaults + positions in DeFi protocols.',
}
