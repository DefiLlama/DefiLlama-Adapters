const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0xeF72cbCcF4A807DfA1fbecd61DdB488fF8a05fa3'
const ALM_VAULT_FACTORY = '0x8d8535C8842Aa541fcB3F6CC436e1b3A816a3a0e'
const USDC = '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07'
const SWITCH = '0x357D80EA5dC53999Da7dA747e7afEBc02fe276Fb'
const WPLS = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27'
const SWITCH_USDC_POOL = '0x066589f69c4016C75883612a50aEc76c4887ac38'
const SWITCH_WPLS_POOL = '0x829f3d4aBAfa6920648188750A8e36220F137B67'
const USDC_WPLS_POOL = '0xb0753197dcBd873c8E8131f3D691C3135C3D8d66'
const FACTORY_FROM_BLOCK = 26521466
// The shared cloud cache can claim complete coverage while omitting PulseChain
// logs. Use the SDK's local cache and bound every RPC fallback range instead.
const MAX_LOG_BLOCK_RANGE = 99_979
const TWAP_WINDOW = 60 * 60
const MAX_ORACLE_AGE = 6 * 60 * 60
const MAX_TIMESTAMP_SKEW = 5 * 60
const MAX_ROUTE_DEVIATION_BPS = 500
const MIN_ROUTE_USDC_RESERVE = 10_000n * 10n ** 6n
const MIN_COMBINED_USDC_RESERVE = 50_000n * 10n ** 6n
const MIN_SWITCH_RESERVE = 1_000_000n * 10n ** 18n
const Decimal = BigNumber.clone({ DECIMAL_PLACES: 40, POW_PRECISION: 40 })

const STANDARD_POOL_CREATED = 'event Pool(address indexed token0, address indexed token1, address pool)'
const CUSTOM_POOL_CREATED = 'event CustomPool(address indexed deployer, address indexed token0, address indexed token1, address pool)'
const ALM_VAULT_CREATED =
  'event ALMVaultCreated(address indexed sender, address almVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint256 count)'
const GET_RESERVES = 'function getReserves() view returns (uint128 reserve0, uint128 reserve1)'
const GET_TIMEPOINTS =
  'function getTimepoints(uint32[] secondsAgos) view returns (int56[] tickCumulatives, uint88[] volatilityCumulatives)'

function lower(address) {
  return address.toLowerCase()
}

function averageTick(tickCumulativeDelta) {
  const window = BigInt(TWAP_WINDOW)
  let tick = tickCumulativeDelta / window
  // Match the oracle-consumer convention: negative, non-exact averages round
  // toward negative infinity rather than Solidity's toward-zero division.
  if (tickCumulativeDelta < 0n && tickCumulativeDelta % window !== 0n) tick -= 1n
  return Number(tick)
}

async function readTwapPool(api, pool, expectedToken0, expectedToken1) {
  const [token0, token1, plugin, reserves] = await Promise.all([
    api.call({ target: pool, abi: 'address:token0' }),
    api.call({ target: pool, abi: 'address:token1' }),
    api.call({ target: pool, abi: 'address:plugin' }),
    api.call({ target: pool, abi: GET_RESERVES }),
  ])

  if (lower(token0) !== lower(expectedToken0) || lower(token1) !== lower(expectedToken1)) {
    throw new Error(`unexpected token order for ${pool}`)
  }

  const [initialized, lastTimestamp, timepoints] = await Promise.all([
    api.call({ target: plugin, abi: 'bool:isInitialized' }),
    api.call({ target: plugin, abi: 'uint32:lastTimepointTimestamp' }),
    api.call({ target: plugin, abi: GET_TIMEPOINTS, params: [[TWAP_WINDOW, 0]] }),
  ])
  if (!initialized) throw new Error(`uninitialized oracle for ${pool}`)

  const now = Number(api.timestamp || Math.floor(Date.now() / 1000))
  const oracleAge = now - Number(lastTimestamp)
  // Historical timestamp-to-block resolution can select the first block a few
  // seconds after midnight. Allow only that bounded mapping skew.
  if (oracleAge < -MAX_TIMESTAMP_SKEW || oracleAge > MAX_ORACLE_AGE) {
    throw new Error(`stale oracle for ${pool}`)
  }

  const tickCumulatives = timepoints.tickCumulatives ?? timepoints[0]
  if (!Array.isArray(tickCumulatives) || tickCumulatives.length !== 2) {
    throw new Error(`invalid oracle response for ${pool}`)
  }
  const tick = averageTick(BigInt(tickCumulatives[1]) - BigInt(tickCumulatives[0]))

  return {
    ratio1Per0: new Decimal('1.0001').pow(tick),
    reserve0: BigInt(reserves.reserve0 ?? reserves[0]),
    reserve1: BigInt(reserves.reserve1 ?? reserves[1]),
  }
}

async function getSwitchUsdcRatio(api) {
  const [direct, switchWpls, usdcWpls] = await Promise.all([
    readTwapPool(api, SWITCH_USDC_POOL, USDC, SWITCH),
    readTwapPool(api, SWITCH_WPLS_POOL, SWITCH, WPLS),
    readTwapPool(api, USDC_WPLS_POOL, USDC, WPLS),
  ])

  if (
    direct.reserve0 < MIN_ROUTE_USDC_RESERVE ||
    usdcWpls.reserve0 < MIN_ROUTE_USDC_RESERVE ||
    direct.reserve0 + usdcWpls.reserve0 < MIN_COMBINED_USDC_RESERVE
  ) {
    throw new Error('insufficient USDC-side oracle liquidity')
  }
  if (direct.reserve1 < MIN_SWITCH_RESERVE || switchWpls.reserve0 < MIN_SWITCH_RESERVE) {
    throw new Error('insufficient SWITCH-side oracle liquidity')
  }

  // Pool ticks quote raw token1 units per raw token0 unit. The direct pool
  // therefore needs inversion, while the two-hop quote divides the two WPLS
  // legs to produce raw USDC units per raw SWITCH unit.
  const directRatio = new Decimal(1).div(direct.ratio1Per0)
  const crossRatio = switchWpls.ratio1Per0.div(usdcWpls.ratio1Per0)
  const lowerRatio = Decimal.minimum(directRatio, crossRatio)
  const divergenceBps = directRatio.minus(crossRatio).abs().div(lowerRatio).times(10_000)
  if (divergenceBps.gt(MAX_ROUTE_DEVIATION_BPS)) throw new Error('SWITCH oracle routes diverged')

  // Use the lower agreeing quote so the custom valuation is conservative.
  return lowerRatio
}

async function tvl(api) {
  const toBlock = await api.getBlock()
  const getFactoryLogs = (target, eventAbi) =>
    sdk.getEventLogs({
      chain: api.chain,
      target,
      fromBlock: FACTORY_FROM_BLOCK,
      toBlock,
      eventAbi,
      onlyArgs: true,
      maxBlockRange: MAX_LOG_BLOCK_RANGE,
    })

  const [standardPools, customPools, almVaults] = await Promise.all([
    getFactoryLogs(FACTORY, STANDARD_POOL_CREATED),
    getFactoryLogs(FACTORY, CUSTOM_POOL_CREATED),
    getFactoryLogs(ALM_VAULT_FACTORY, ALM_VAULT_CREATED),
  ])

  const owners = new Map()
  for (const { token0, token1, pool } of [...standardPools, ...customPools]) {
    owners.set(pool.toLowerCase(), { token0, token1, owner: pool })
  }
  // ALM liquidity positions are already included in pool balances. Only the
  // vaults' idle underlying balances are additional TVL, so count their
  // token0/token1 balances without valuing vault shares or NFT positions.
  for (const { almVault, tokenA, tokenB } of almVaults) {
    owners.set(almVault.toLowerCase(), { token0: tokenA, token1: tokenB, owner: almVault })
  }

  const ownerEntries = [...owners.values()]
  const switchOwners = ownerEntries
    .filter(({ token0, token1 }) => lower(token0) === lower(SWITCH) || lower(token1) === lower(SWITCH))
    .map(({ owner }) => ({ target: SWITCH, params: owner }))
  const [switchBalances] = await Promise.all([
    switchOwners.length
      ? api.multiCall({
          abi: 'erc20:balanceOf',
          calls: switchOwners,
          permitFailure: true,
        })
      : Promise.resolve([]),
    sumTokens2({
      api,
      ownerTokens: ownerEntries.map(({ token0, token1, owner }) => [[token0, token1], owner]),
      // SWITCH has no DefiLlama coin price yet. It is handled once below so it
      // cannot be double counted if the shared price service later adds it.
      blacklistedTokens: [SWITCH],
      // Standard pool creation is permissionless. Isolate non-compliant or
      // reverting ERC-20 balanceOf calls so one hostile pool cannot break TVL.
      permitFailure: true,
    }),
  ])
  const totalSwitch = switchBalances.reduce((total, balance) => total + BigInt(balance || 0), 0n)

  if (totalSwitch !== 0n) {
    try {
      const switchUsdcRatio = await getSwitchUsdcRatio(api)
      const usdcEquivalent = switchUsdcRatio
        .times(totalSwitch.toString())
        .integerValue(Decimal.ROUND_FLOOR)
        .toFixed(0)
      api.add(USDC, usdcEquivalent)
    } catch {
      // Preserve raw SWITCH on early historical blocks or during a guarded
      // oracle outage. This keeps the rest of TVL live and allows DefiLlama's
      // shared price service to value the token if support becomes available.
      api.add(SWITCH, totalSwitch.toString())
    }
  }

  return api.getBalances()
}

module.exports = {
  start: '2026-05-13',
  misrepresentedTokens: true,
  methodology:
    'TVL is the value of token0 and token1 balances held by every standard and custom concentrated-liquidity pool created by the canonical SwitchX factory on PulseChain, plus idle underlying token balances held directly by canonical SwitchX ALM vaults. SWITCH balances are represented as USDC using the lower of an on-chain one-hour SWITCH/USDC TWAP and an independently derived SWITCH/WPLS/USDC TWAP, only while both routes have initialized, fresh oracles, minimum SWITCH and USDC liquidity, and no more than 5% divergence. ALM position liquidity is already custodied by the pools, so vault receipt tokens, farming positions, ve-locked SWITCH, rewards, treasury balances, and other protocol-owned assets are excluded to avoid double counting.',
  pulse: { tvl },
}
