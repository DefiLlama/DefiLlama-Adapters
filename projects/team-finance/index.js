const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")
const { getCoreAssets, getUniqueAddresses, } = require("../helper/tokenMapping")
const { getSqrtPriceX96AtTick, } = require("../helper/utils/tick")
const config = require("./config")

const project = 'bulky/team-finance'

const v3PositionsAbi = 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)'
const algebraPositionsAbi = 'function positions(uint256) view returns (uint88 nonce, address operator, address token0, address token1, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)'

// Uniswap V3 style position managers whose positions can be locked with lockNFT
const positionManagers = {
  ethereum: {
    '0xc36442b4a4522e871399cd717abdd847ab11fe88': {}, // Uniswap
    '0x46a15b0b27311cedf172ab29e4f4766fbe7f4364': {}, // PancakeSwap
  },
  bsc: {
    '0x46a15b0b27311cedf172ab29e4f4766fbe7f4364': {}, // PancakeSwap
    '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613': {}, // Uniswap
  },
  base: {
    '0x03a520b32c04bf3beef7beb72e919cf822ed34f1': {}, // Uniswap
    '0x46a15b0b27311cedf172ab29e4f4766fbe7f4364': {}, // PancakeSwap
  },
  arbitrum: {
    '0xc36442b4a4522e871399cd717abdd847ab11fe88': {}, // Uniswap
  },
  polygon: {
    '0xc36442b4a4522e871399cd717abdd847ab11fe88': {}, // Uniswap
    '0xb7402ee99f0a008e461098ac3a27f4957df89a40': {}, // SushiSwap
    '0x8ef88e4c7cfbbac1c163f7eddd4b578792201de6': { isAlgebra: true, }, // QuickSwap
  },
  avax: {
    '0x655c406ebfa14ee2006250925e54ec43ad184f8b': {}, // Uniswap
  },
  flare: {
    '0xee5ff5bc5f852764b5584d92a4d592a53dc527da': {}, // SparkDEX
  },
  unichain: {
    '0x943e6e07a7e8e791dafc44083e54041d743c46e9': {}, // Uniswap
  },
  robinhood: {
    '0x73991a25c818bf1f1128deaab1492d45638de0d3': {}, // Uniswap
  },
  arc: {
    '0x39654a85a4c05127f5fd6ed22caec077a0fb1377': {}, // Uniswap
  },
}

async function tvl(api) {
  const chain = api.chain
  const args = config[chain]
  const cache = (await getCache(project, chain)) || {}
  if (!cache.vaults) cache.vaults = {}
  const v3Positions = {} // position manager -> [{ id, locker }]

  for (const { contractABI, contract, blacklist, } of args) {
    // `nfts` and `lastId` were added later, so a vault cached before that is rescanned once
    if (!cache.vaults[contract]?.nfts) cache.vaults[contract] = { tokens: [], nfts: {}, lastId: 0, }
    const cCache = cache.vaults[contract]
    // deposit ids start at 1 and run up to depositId inclusive
    const deposits = await api.fetchList({ lengthAbi: contractABI.depositId, itemAbi: contractABI.getDepositDetails, target: contract, permitFailure: true, startFromOne: true, startFrom: cCache.lastId + 1 })
    // stop at the first failed read so it is retried on the next run
    const failedAt = deposits.findIndex(i => !i)
    const read = failedAt === -1 ? deposits : deposits.slice(0, failedAt)
    cCache.lastId += read.length

    for (const { _tokenAddress, _isNFT, _tokenId, } of read) {
      if (!_isNFT) {
        cCache.tokens.push(_tokenAddress)
        continue
      }
      const nft = _tokenAddress.toLowerCase()
      if (!cCache.nfts[nft]) cCache.nfts[nft] = []
      cCache.nfts[nft].push(String(_tokenId))
    }

    await vestingHelper({ api, cache, useDefaultCoreAssets: true, owner: contract, tokens: cCache.tokens, blacklist, })

    for (const [nft, ids] of Object.entries(cCache.nfts)) {
      if (!positionManagers[chain]?.[nft]) continue
      if (!v3Positions[nft]) v3Positions[nft] = []
      // a position can be withdrawn and locked again, which gives it a second deposit
      v3Positions[nft].push(...[...new Set(ids)].map(id => ({ id, locker: contract })))
    }
  }

  await setCache(project, chain, cache)

  const whitelistedTokens = getUniqueAddresses(getCoreAssets(chain), chain)
  for (const [nftAddress, positions] of Object.entries(v3Positions))
    await addV3Positions({ api, nftAddress, positions, whitelistedTokens, ...positionManagers[chain][nftAddress] })
}

// Values each position by its core asset side. Positions without a core asset are skipped.
async function addV3Positions({ api, nftAddress, positions, whitelistedTokens, isAlgebra = false }) {
  // a position id outlives its lock, so count it only while the locker still owns it
  const owners = await api.multiCall({ abi: 'function ownerOf(uint256) view returns (address)', target: nftAddress, calls: positions.map(p => p.id), permitFailure: true })
  const lockedIds = positions.filter((p, i) => owners[i]?.toLowerCase() === p.locker.toLowerCase()).map(p => p.id)
  if (!lockedIds.length) return

  const isCore = token => whitelistedTokens.includes(token.toLowerCase())
  const infos = (await api.multiCall({ abi: isAlgebra ? algebraPositionsAbi : v3PositionsAbi, target: nftAddress, calls: lockedIds, permitFailure: true }))
    .filter(info => info && +info.liquidity > 0 && (isCore(info.token0) || isCore(info.token1)))
  if (!infos.length) return

  const factory = await api.call({ target: nftAddress, abi: 'address:factory' })
  const pools = await api.multiCall({
    target: factory,
    abi: isAlgebra ? 'function poolByPair(address, address) view returns (address)' : 'function getPool(address, address, uint24) view returns (address)',
    calls: infos.map(i => ({ params: isAlgebra ? [i.token0, i.token1] : [i.token0, i.token1, i.fee] })),
  })
  const sqrtPrices = await api.multiCall({
    abi: isAlgebra ? 'function globalState() view returns (uint160 price)' : 'function slot0() view returns (uint160 sqrtPriceX96)',
    calls: pools,
  })

  // Core asset amount per pool. When only one side is a core asset, the other side adds its value at the
  // pool price, but never more than the core side, as with a V2 pair. So a position that is out of range
  // and holds only the core asset counts once, and a project token can not be valued above its liquidity.
  const poolAmounts = {}
  infos.forEach((info, i) => {
    const { amount0, amount1 } = getPositionAmounts(info, sqrtPrices[i])
    const price = (Number(sqrtPrices[i]) / 2 ** 96) ** 2 // token1 per token0
    const core0 = isCore(info.token0)
    const core1 = isCore(info.token1)
    if (core0 && core1) {
      addPoolAmount(pools[i], info.token0, amount0, 0)
      addPoolAmount(pools[i], info.token1, amount1, 0)
    } else if (core1) {
      addPoolAmount(pools[i], info.token1, amount1, Math.min(amount0 * price || 0, amount1))
    } else {
      addPoolAmount(pools[i], info.token0, amount0, Math.min(amount1 / price || 0, amount0))
    }
  })

  // Positions with huge liquidity next to a range edge are very sensitive to float precision, so never
  // count more of a core asset than the pool holds
  const entries = Object.values(poolAmounts)
  const poolBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: entries.map(e => ({ target: e.token, params: e.pool })) })
  entries.forEach((e, i) => {
    const scale = e.core > 0 ? Math.min(1, +poolBalances[i] / e.core) : 0
    api.add(e.token, (e.core + e.other) * scale)
  })

  function addPoolAmount(pool, token, core, other) {
    const key = `${pool}-${token}`
    if (!poolAmounts[key]) poolAmounts[key] = { pool, token, core: 0, other: 0 }
    poolAmounts[key].core += core
    poolAmounts[key].other += other
  }
}

function getPositionAmounts({ tickLower, tickUpper, liquidity }, sqrtPriceX96) {
  const sp = Number(sqrtPriceX96) / 2 ** 96
  const sa = Number(getSqrtPriceX96AtTick(+tickLower)) / 2 ** 96
  const sb = Number(getSqrtPriceX96AtTick(+tickUpper)) / 2 ** 96
  liquidity = Number(liquidity)
  if (sp <= sa) return { amount0: liquidity * (sb - sa) / (sa * sb), amount1: 0 }
  if (sp >= sb) return { amount0: 0, amount1: liquidity * (sb - sa) }
  return { amount0: liquidity * (sb - sp) / (sp * sb), amount1: liquidity * (sp - sa) }
}

module.exports = {
  methodology: `Counts each LP pair's native token and
  stable balance, adjusted to reflect locked pair's value.
  Balances and merged across multiple locker to return sum TVL per chain.
  Locked Uniswap V3 style positions count their native token and stable side the same way`,
  misrepresentedTokens: true,
  isHeavyProtocol: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
