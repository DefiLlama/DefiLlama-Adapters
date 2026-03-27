const { ApiPromise, WsProvider } = require('@polkadot/api')
const { postURL } = require('../helper/utils')
const { cgMapping } = require('../hydradx/api')
const { methodology } = require('../helper/aave')

const REGISTRY = '0x1b02E051683b5cfaC5929C25E84adb26ECf87B38'
const INDEXER_URL = 'https://orca-main-aggr-indx.indexer.hydration.cloud/graphql'
const GET_RESERVE_DATA_ABI = "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))"

// Decode HydraDX substrate asset ID from EVM precompile address.
// Format: 0x 000000000000000000000000 00000001 XXXXXXXX (last 4 bytes = asset ID)
function assetIdFromPrecompile(address) {
  const hex = address.toLowerCase().replace('0x', '')
  if (!hex.startsWith('00000000000000000000000000000001')) return null
  return parseInt(hex.slice(32), 16)
}

// Fetch stableswap pool map from indexer: poolId (int) -> SS58 accountId.
// In HydraDX stableswap, pool ID = share token asset ID.
async function fetchStableswapPoolMap() {
  const query = `{ stableswaps(first: 1000) { nodes { id accountId } } }`
  const res = await postURL(INDEXER_URL, { query })
  const poolMap = new Map()
  for (const { id, accountId } of res.data.data.stableswaps.nodes) {
    poolMap.set(parseInt(id), accountId)
  }
  return poolMap
}

// Split reserves into direct (have cgId) and LP token (no cgId, need unwrapping).
async function getReservesMeta(api) {
  const reserves = await api.call({ abi: 'address[]:getReservesList', target: REGISTRY })
  const [reserveData, symbols, decimals] = await Promise.all([
    api.multiCall({ abi: GET_RESERVE_DATA_ABI, calls: reserves, target: REGISTRY }),
    api.multiCall({ abi: 'erc20:symbol', calls: reserves }),
    api.multiCall({ abi: 'erc20:decimals', calls: reserves }),
  ])

  const directReserves = []
  const lpReserves = []
  reserves.forEach((underlying, i) => {
    const base = {
      underlying,
      aTokenAddress: reserveData[i].aTokenAddress,
      variableDebtTokenAddress: reserveData[i].variableDebtTokenAddress,
      stableDebtTokenAddress: reserveData[i].stableDebtTokenAddress,
      decimals: decimals[i],
    }
    const cgId = cgMapping[symbols[i]]
    if (cgId) {
      directReserves.push({ ...base, cgId })
    } else {
      const assetId = assetIdFromPrecompile(underlying)
      if (assetId !== null) {
        lpReserves.push({ ...base, assetId })
      }
    }
  })
  return { directReserves, lpReserves }
}

// Unwrap LP token reserves into their underlying assets and add to api balances.
// getLpAmount(reserve) should return the LP token amount (BigInt or numeric string) to unwrap.
async function addLpTvl(api, lpReserves, getLpAmount) {
  if (!lpReserves.length) return

  const provider = new WsProvider('wss://rpc.hydradx.cloud')
  const polkadotApi = await ApiPromise.create({ provider })

  try {
    // Build asset metadata map from the on-chain registry
    const allAssets = await polkadotApi.query.assetRegistry.assets.entries()
    const assetMeta = new Map()
    for (const [key, metaOpt] of allAssets) {
      if (metaOpt.isSome) {
        const meta = metaOpt.unwrap()
        const assetId = Number(key.args[0].toBigInt())
        if (assetId > 0 && assetId <= Number.MAX_SAFE_INTEGER) {
          assetMeta.set(assetId, { symbol: meta.symbol.toHuman(), decimals: +meta.decimals })
        }
      }
    }

    // Pool ID -> SS58 accountId from indexer
    const poolMap = await fetchStableswapPoolMap()

    for (const reserve of lpReserves) {
      try {
        const { assetId: lpAssetId } = reserve

        // Pool account where underlying assets are held
        const accountId = poolMap.get(lpAssetId)
        if (!accountId) continue

        // Pool composition: list of underlying asset IDs
        const poolOpt = await polkadotApi.query.stableswap.pools(lpAssetId)
        if (!poolOpt.isSome) continue
        const poolAssetIds = poolOpt.unwrap().assets.toJSON()

        // LP total supply and the amount held in this reserve
        const lpTotalSupply = (await polkadotApi.query.tokens.totalIssuance(lpAssetId)).toBigInt()
        if (lpTotalSupply === 0n) continue

        const lpAmount = BigInt(await getLpAmount(reserve))
        if (lpAmount === 0n) continue

        const fraction = Number(lpAmount) / Number(lpTotalSupply)

        // Pro-rate each underlying asset's pool balance by the LP share fraction
        for (const poolAssetId of poolAssetIds) {
          const meta = assetMeta.get(poolAssetId)
          if (!meta) continue
          // Skip aToken pool assets (e.g. aUSDT, aSOL) — already counted in direct reserves
          if (/^a[A-Z]/.test(meta.symbol)) continue
          const cgId = cgMapping[meta.symbol]
          if (!cgId) continue

          const bal = await polkadotApi.call.currenciesApi.account(poolAssetId, accountId)
          const balance = Number(bal.free.toBigInt())
          if (balance > 0) {
            api.add(cgId, balance * fraction / (10 ** meta.decimals), { skipChain: true })
          }
        }
      } catch (e) {
        console.error(`hydration-lending: error processing LP reserve assetId=${reserve.assetId}:`, e)
      }
    }
  } finally {
    await polkadotApi.disconnect()
  }
}

async function tvl(api) {
  const { directReserves, lpReserves } = await getReservesMeta(api)

  // Direct reserves: balanceOf(underlying, aToken)
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: directReserves.map(m => ({ target: m.underlying, params: [m.aTokenAddress] })),
  })
  directReserves.forEach((m, i) => {
    api.add(m.cgId, Number(balances[i] || 0) / (10 ** m.decimals), { skipChain: true })
  })

  // LP reserves: unwrap pool shares into underlying assets
  await addLpTvl(api, lpReserves, async (reserve) =>
    api.call({ abi: 'erc20:balanceOf', target: reserve.underlying, params: [reserve.aTokenAddress] })
  )

  return api.getBalances()
}

async function borrowed(api) {
  const { directReserves, lpReserves } = await getReservesMeta(api)

  // Direct reserves: totalSupply(variableDebt) + totalSupply(stableDebt)
  const [variableSupply, stableSupply] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: directReserves.map(m => m.variableDebtTokenAddress) }),
    api.multiCall({ abi: 'erc20:totalSupply', calls: directReserves.map(m => m.stableDebtTokenAddress) }),
  ])
  directReserves.forEach((m, i) => {
    const total = BigInt(variableSupply[i] || 0) + BigInt(stableSupply[i] || 0)
    if (total > 0n) {
      api.add(m.cgId, Number(total) / (10 ** m.decimals), { skipChain: true })
    }
  })

  // LP reserves: borrowed = sum of variable + stable debt token supplies
  await addLpTvl(api, lpReserves, async (reserve) => {
    const [varSupply, stabSupply] = await Promise.all([
      api.call({ abi: 'erc20:totalSupply', target: reserve.variableDebtTokenAddress }),
      api.call({ abi: 'erc20:totalSupply', target: reserve.stableDebtTokenAddress }),
    ])
    return BigInt(varSupply || 0) + BigInt(stabSupply || 0)
  })

  return api.getBalances()
}

module.exports = {
  methodology,
  hydradx: { tvl, borrowed },
}
