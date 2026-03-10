const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const LBTCV = '0x5401b8620E5FB570064CA9114fd1e135fd77D57c'       // vault (ETH/Base/BSC)
const SONIC_VAULT = '0x309f25d839a2fe225e80210e110C99150Db98AAF'  // vault (Sonic)

const UNIV4_ETH_NFT = '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e'
const UNIV4_ETH_DEPLOY_BLOCK = 21689089
const TRANSFER_EVENT_ABI = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const LBTC = '0xecAc9C5F704e954931349Da37F60E39f515c11c1'

// ── Add new BoringVault tokens here ──────────────────────────────────────────
// Unwrapped to underlying base asset in tvlEthExtras.
const BORING_VAULTS_ETH = [
  '0x75231079973c23e9eb6180fa3d2fc21334565ab5',  // Turtle Club (katanaLBTCv)
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
async function unwrapBoringVault(api, vaultToken, holder) {
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
  api.add(baseAsset, amount)
}

function addressToTopic(address) {
  return '0x' + address.toLowerCase().replace(/^0x/, '').padStart(64, '0')
}

async function getOwnedUniV4PositionIds({ api, owner, nftAddress, fromBlock }) {
  const ownerTopic = addressToTopic(owner)
  // Full log objects (no onlyArgs) are needed to get blockNumber/logIndex for
  // correct chronological ordering. add-then-delete without ordering loses
  // round-trips: token sent out and returned would be excluded.
  const [received, sent] = await Promise.all([
    getLogs({
      api, target: nftAddress, eventAbi: TRANSFER_EVENT_ABI,
      topics: [TRANSFER_EVENT_TOPIC, null, ownerTopic],
      fromBlock, extraKey: `univ4-received-${owner.toLowerCase()}`,
    }),
    getLogs({
      api, target: nftAddress, eventAbi: TRANSFER_EVENT_ABI,
      topics: [TRANSFER_EVENT_TOPIC, ownerTopic],
      fromBlock, extraKey: `univ4-sent-${owner.toLowerCase()}`,
    }),
  ])

  const allEvents = [
    ...received.map(log => ({ blockNumber: log.blockNumber, logIndex: log.logIndex ?? 0, tokenId: log.args.tokenId.toString(), type: 'in' })),
    ...sent.map(log => ({ blockNumber: log.blockNumber, logIndex: log.logIndex ?? 0, tokenId: log.args.tokenId.toString(), type: 'out' })),
  ].sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex)

  const active = new Set()
  for (const { tokenId, type } of allEvents) {
    if (type === 'in') active.add(tokenId)
    else active.delete(tokenId)
  }
  return [...active]
}

// ─── Per-chain extra TVL hooks ────────────────────────────────────────────────

async function tvlEthExtras(api) {
  // 1. Unwrap Curve LP pools (add new pools to CURVE_POOLS_ETH above)
  for (const { pool, coinCount } of CURVE_POOLS_ETH) {
    await unwrapCurvePoolShare({ api, pool, holder: LBTCV, coinCount })
  }

  // 2. Unwrap BoringVault shares (add new vaults to BORING_VAULTS_ETH above)
  for (const vault of BORING_VAULTS_ETH) {
    await unwrapBoringVault(api, vault, LBTCV)
  }

  // 3. Uniswap V4 concentrated liquidity positions
  const positionIds = await getOwnedUniV4PositionIds({
    api, owner: LBTCV, nftAddress: UNIV4_ETH_NFT, fromBlock: UNIV4_ETH_DEPLOY_BLOCK,
  })
  if (positionIds.length) {
    await sumTokens2({
      api, owner: LBTCV, resolveUniV4: true,
      uniV4ExtraConfig: { nftAddress: UNIV4_ETH_NFT, positionIds },
    })
  }
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
