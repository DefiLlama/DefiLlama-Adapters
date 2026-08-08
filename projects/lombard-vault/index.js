const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')

const LBTCV = '0x5401b8620E5FB570064CA9114fd1e135fd77D57c'       // vault (ETH/Base/BSC)
const SONIC_VAULT = '0x309f25d839a2fe225e80210e110C99150Db98AAF'  // vault (Sonic)

const LBTC = ADDRESSES.etlk.LBTC

// ── Add new BoringVault tokens here ──────────────────────────────────────────
// `asset` overrides the accountant base asset (equivalent BTC unit).
const BORING_VAULTS_ETH = [
  { token: '0x75231079973c23e9eb6180fa3d2fc21334565ab5' },  // Turtle Club (katanaLBTCv) -> accountant base
  // Sentora (sLBTC): backing sits as LBTC in SupervisedLoanPositionManager
  // 0x6cad5fcb29d98c4968a79ea7db286c5986389009; accountant base WBTC is pricing unit only.
  { token: '0x13cc1b39cb259ba10cd174eae42012e698ed7c51', asset: ADDRESSES.ethereum.LBTC },
]

// ── Add new pricePerShare vault tokens here ───────────────────────────────────
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
// No `permitFailure` anywhere: pools/vaults are hardcoded, so a failed read must
// throw (keeps last known-good TVL) rather than silently omit the position.

// Curve StableSwap-NG LP share held by `holder` -> underlying coins.
async function unwrapCurvePoolShare({ api, pool, holder, coinCount }) {
  const lpBalance = await api.call({ target: pool, abi: 'erc20:balanceOf', params: [holder] })
  if (!lpBalance || lpBalance === '0') return

  const totalSupply = await api.call({ target: pool, abi: 'erc20:totalSupply' })
  if (!totalSupply || totalSupply === '0') return

  api.removeTokenBalance(pool)  // no-op if not present

  const lpBI = BigInt(lpBalance)
  const supplyBI = BigInt(totalSupply)

  for (let i = 0; i < coinCount; i++) {
    const token = await api.call({
      target: pool, abi: 'function coins(uint256) view returns (address)', params: [i],
    })
    if (!token || token.toLowerCase() === ADDRESSES.null.toLowerCase()) break

    const poolBal = await api.call({
      target: pool, abi: 'function balances(uint256) view returns (uint256)', params: [i],
    })

    const amount = BigInt(poolBal) * lpBI / supplyBI
    if (amount > 0n) api.add(token, amount)
  }
}

// BoringVault shares -> base asset, via Vault -> Hook -> Accountant -> (base, rate).
async function unwrapBoringVault(api, vaultToken, holder, assetOverride) {
  const shareBalance = await api.call({ target: vaultToken, abi: 'erc20:balanceOf', params: [holder] })
  if (!shareBalance || shareBalance === '0') return

  const hook = await api.call({ target: vaultToken, abi: 'address:hook' })
  const accountant = await api.call({ target: hook, abi: 'address:accountant' })

  const [baseAsset, rate, decimals] = await Promise.all([
    api.call({ target: accountant, abi: 'address:base' }),
    api.call({ target: accountant, abi: 'uint256:getRate' }),
    api.call({ target: accountant, abi: 'uint8:decimals' }),
  ])

  const scale = 10n ** BigInt(decimals)
  const amount = BigInt(shareBalance) * BigInt(rate) / scale
  if (amount <= 0n) return
  api.add(assetOverride || baseAsset, amount)
}

// ERC4626-style shares -> asset() * pricePerShare().
async function unwrapPpsVault(api, vaultToken, holder) {
  const shareBalance = await api.call({ target: vaultToken, abi: 'erc20:balanceOf', params: [holder] })
  if (!shareBalance || shareBalance === '0') return

  const [asset, pricePerShare, decimals] = await Promise.all([
    api.call({ target: vaultToken, abi: 'address:asset' }),
    api.call({ target: vaultToken, abi: 'function pricePerShare() view returns (uint256)' }),
    api.call({ target: vaultToken, abi: 'erc20:decimals' }),
  ])

  // pricePerShare = asset units per 10^decimals shares
  const scale = 10n ** BigInt(decimals)
  const amount = BigInt(shareBalance) * BigInt(pricePerShare) / scale
  if (amount <= 0n) return
  api.add(asset, amount)
}

// ─── Per-chain extra TVL hooks ────────────────────────────────────────────────

async function tvlEthExtras(api) {
  // Curve LP pools
  for (const { pool, coinCount } of CURVE_POOLS_ETH) {
    await unwrapCurvePoolShare({ api, pool, holder: LBTCV, coinCount })
  }

  // BoringVault shares
  for (const { token, asset } of BORING_VAULTS_ETH) {
    await unwrapBoringVault(api, token, LBTCV, asset)
  }

  // pricePerShare vault shares
  for (const vault of PPS_VAULTS_ETH) {
    await unwrapPpsVault(api, vault, LBTCV)
  }

  await sumTokens2({ api, owner: LBTCV, resolveUniV4: true, })
}

async function tvlCornExtras(api) {
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
