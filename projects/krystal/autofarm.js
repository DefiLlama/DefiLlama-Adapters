const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, unwrapUniswapV3NFT, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')
const { getLowValueCache } = require('../helper/cache/lowValue')
const { getCache, setCache } = require('../helper/cache')
const { sliceIntoChunks } = require('../helper/utils')

const VAULTS_PER_GROUP = 2000

// Not counted, in both Autofarm and Community vaults because the position ids cannot be enumerated on chain: Uniswap V4 and
// PancakeSwap Infinity positions (their position managers are not ERC721Enumerable), and Aerodrome
// positions staked into a CL gauge (the gauge takes custody of the NFT). Unstaked Aerodrome
// positions are counted.
const config = {
  ethereum: {
    factory: '0x99029ddf03de6446524f7ffa6585458b58dc1eee',
    fromBlock: 24374811,
    uniV3Nfpms: [
      '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', // Uniswap V3
      '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', // PancakeSwap V3
      '0x2214A42d8e2A1d20635c2cb0664422c528B6A432', // SushiSwap V3
    ],
    farms: [
      // PancakeV3FarmingStrategy stakes into MasterChefV3, which custodies the NFT and tracks the
      // vault as its owner - so it doubles as the position-id source for staked positions.
      { nfpm: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', nftIdFetcher: '0x556B9306565093C855AEA9AE92A594704c2Cd59e' },
    ],
    idleTokens: [
      ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.DAI, ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.cbBTC,
    ],
  },
  base: {
    factory: '0x99029ddf03de6446524f7ffa6585458b58dc1eee',
    fromBlock: 40491633,
    uniV3Nfpms: [
      '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', // Uniswap V3
      '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', // PancakeSwap V3
      '0x80C7DD17B01855a6D2347444a0FCC36136a314de', // SushiSwap V3
    ],
    // AerodromeFarmingStrategy / lpValidatorAerodrome - Slipstream v1, v2, v3
    slipstreamNfpms: [
      '0x827922686190790b37229fd06084350E74485b72',
      '0xa990C6a764b73BF43cee5Bb40339c3322FB9D55F',
      '0xe1f8cd9AC4e4A65F54f38a5CdAfCA44f6dD68b53',
    ],
    farms: [
      { nfpm: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', nftIdFetcher: '0xC6A2Db661D5a5690172d8eB0a7DEA2d3008665A3' },
    ],
    idleTokens: [
      ADDRESSES.base.WETH, ADDRESSES.base.USDC, ADDRESSES.base.USDbC,
      ADDRESSES.base.USDT, ADDRESSES.base.DAI, ADDRESSES.base.cbBTC,
    ],
  },
  arbitrum: {
    factory: '0x99029ddf03de6446524f7ffa6585458b58dc1eee',
    fromBlock: 418784587,
    uniV3Nfpms: [
      '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', // Uniswap V3
      '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', // PancakeSwap V3
      '0xF0cBce1942A68BEB3d1b73F0dd86C8DCc363eF49', // SushiSwap V3
    ],
    farms: [
      { nfpm: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', nftIdFetcher: '0x5e09ACf80C0296740eC5d6F643005a4ef8DaA694' },
    ],
    idleTokens: [
      ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE,
      ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.DAI, ADDRESSES.arbitrum.WBTC,
    ],
  },
  polygon: {
    factory: '0x99029ddf03de6446524f7ffa6585458b58dc1eee',
    fromBlock: 82270455,
    uniV3Nfpms: [
      '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', // Uniswap V3
      '0xb7402ee99F0A008e461098AC3A27F4957Df89a40', // SushiSwap V3
    ],
    idleTokens: [
      ADDRESSES.polygon.WMATIC, ADDRESSES.polygon.WETH, ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT, ADDRESSES.polygon.DAI,
      ADDRESSES.polygon.WBTC,
    ],
  },
  bsc: {
    factory: '0x99029ddf03de6446524f7ffa6585458b58dc1eee',
    fromBlock: 74360617,
    uniV3Nfpms: [
      '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613', // Uniswap V3
      '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', // PancakeSwap V3
      '0xF70c086618dcf2b1A461311275e00D6B722ef914', // SushiSwap V3
    ],
    farms: [
      { nfpm: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', nftIdFetcher: '0x556B9306565093C855AEA9AE92A594704c2Cd59e' },
    ],
    idleTokens: [
      ADDRESSES.bsc.WBNB, ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.BTCB, ADDRESSES.bsc.ETH, ADDRESSES.bsc.FDUSD,
    ],
  },
  robinhood: {
    factory: '0x99029ddf03de6446524f7ffa6585458b58dc1eee',
    fromBlock: 9362990,
    uniV3Nfpms: [
      '0x73991a25c818bf1f1128deaab1492d45638de0d3', // Uniswap V3
    ],
    idleTokens: [ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG, ADDRESSES.robinhood.USDe],
  },
  hyperliquid: {
    factory: '0xb7166204401cb23dafe02c4aae0a254a4d329adb',
    fromBlock: 36529268,
    uniV3Nfpms: [
      '0x6eDA206207c09e5428F281761DdC0D300851fBC8', // HyperSwap V3
      '0xeaD19AE861c29bBb2101E834922B2FEee69B9091', // Project X
      '0xC8352A2EbA29F4d9BD4221c07D3461BaCc779088', // Upheaval V3
    ],
    idleTokens: [
      ADDRESSES.hyperliquid.WHYPE, ADDRESSES.hyperliquid.USDT0,
      ADDRESSES.hyperliquid.USDC, ADDRESSES.hyperliquid.USDe,
    ],
  },
}

const abis = {
  vaultCreated: 'event VaultCreated(address indexed owner, address indexed vault, string name)',
  tokenOfOwnerByIndex: 'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
  positions: {
    uniV3: 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
    slipstream: 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
  },
}

// A vault mints a new position NFT every time it rebalances and keeps the old, emptied one: BSC alone has ~570k position
// NFTs across ~3k vaults, and about 99% of them hold no liquidity. Enumerating and reading every one of them on every
// run is what made this adapter time out. So this is stored per position source and vault:
//   [time of the last full read, id at the last index, NFT count, ids with liquidity, ids without, tokens of all its positions]
// and on a run:
//  - the NFT count and the id at the last index are read. Both unchanged: the stored list is used and only the positions
//    that had liquidity are read. Either changed: the vault's ids are enumerated again, and of those only the ids not
//    already known to be empty are read.
//  - once a week every vault is read in full again. That also catches what the two checks cannot see: an emptied
//    position that got liquidity back, or a mint plus a burn that left the count and the last id as they were.
const POSITIONS_RECHECK_SECONDS = 7 * 24 * 3600

// `fetcher` is whichever contract reports ownership: the position manager itself for positions sitting in the vault,
// or a farm that has taken custody of the NFT but still credits the vault.
async function addPositions(api, { nfpm, fetcher, kind, vaults, vaultTokens, withLiquidity, unreadable, stored, now }) {
  const counts = await api.multiCall({ abi: 'erc20:balanceOf', target: fetcher, calls: vaults, permitFailure: true })

  const isFresh = (vault, i) => stored[vault] && stored[vault][2] === +counts[i] && now - stored[vault][0] < POSITIONS_RECHECK_SECONDS
  const lastIdChecks = vaults.filter((vault, i) => +counts[i] && isFresh(vault, i))
  const lastIds = await api.multiCall({ abi: abis.tokenOfOwnerByIndex, target: fetcher, calls: lastIdChecks.map(vault => ({ params: [vault, stored[vault][2] - 1] })), permitFailure: true })
  const lastIdOf = {}
  lastIdChecks.forEach((vault, i) => lastIdOf[vault] = lastIds[i])

  const liveIds = [] // { id, vault }
  const toEnumerate = [] // { vault, count }
  const failed = new Set() // vaults with a failed read from this source: counted with what was read, nothing stored
  vaults.forEach((vault, i) => {
    if (counts[i] == null) return failed.add(vault)
    const count = +counts[i]
    if (!count) return delete stored[vault]
    const record = stored[vault]
    if (isFresh(vault, i) && lastIdOf[vault] != null && +lastIdOf[vault] === record[1]) {
      record[3].forEach(id => liveIds.push({ id, vault }))
      record[5].forEach(token => vaultTokens[vault].add(token))
    } else toEnumerate.push({ vault, count })
  })

  const ids = await api.multiCall({
    abi: abis.tokenOfOwnerByIndex, target: fetcher, permitFailure: true,
    calls: toEnumerate.flatMap(({ vault, count }) => Array.from({ length: count }, (_, index) => ({ params: [vault, index] }))),
  })

  const toRead = [] // { id, vault }
  const pending = {}
  let offset = 0
  for (const { vault, count } of toEnumerate) {
    const vaultIds = ids.slice(offset, offset + count)
    offset += count
    if (vaultIds.some(id => id == null)) failed.add(vault)
    const record = stored[vault]
    const reuse = record && now - record[0] < POSITIONS_RECHECK_SECONDS
    const knownEmpty = new Set(reuse ? record[4] : [])
    // a vault read for the first time gets a random age, so the weekly full reads are spread across runs
    const checkedAt = reuse ? record[0] : record ? now : now - Math.floor(Math.random() * POSITIONS_RECHECK_SECONDS)
    const state = pending[vault] = { ids: vaultIds.filter(id => id != null).map(Number), live: [], empty: [], tokens: new Set(reuse ? record[5] : []), checkedAt }
    for (const id of state.ids) {
      if (knownEmpty.has(id)) state.empty.push(id)
      else toRead.push({ id, vault })
    }
  }

  const positions = await api.multiCall({ abi: abis.positions[kind], target: nfpm, calls: toRead.map(({ id }) => id), permitFailure: true })
  positions.forEach((position, i) => {
    const { id, vault } = toRead[i]
    if (!position) return failed.add(vault)
    const state = pending[vault]
    // the pair of every position, emptied ones included: a vault that exited a position may still hold its tokens idle
    state.tokens.add(position.token0.toLowerCase())
    state.tokens.add(position.token1.toLowerCase())
    if (position.liquidity === '0') return state.empty.push(id)
    state.live.push(id)
    liveIds.push({ id, vault })
  })

  for (const { vault } of toEnumerate) {
    const state = pending[vault]
    state.tokens.forEach(token => vaultTokens[vault].add(token))
    if (failed.has(vault)) delete stored[vault]
    else stored[vault] = [state.checkedAt, state.ids[state.ids.length - 1], state.ids.length, state.live, state.empty, [...state.tokens]]
  }
  failed.forEach(vault => unreadable.add(vault))

  liveIds.forEach(({ vault }) => withLiquidity.add(vault))
  if (!liveIds.length) return
  const positionIds = liveIds.map(({ id }) => id)
  const unwrap = kind === 'slipstream' ? unwrapSlipstreamNFT : unwrapUniswapV3NFT
  await unwrap({ api, nftAddress: nfpm, positionIds, uniV3ExtraConfig: { positionIds } })
}

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'

// Idle balances of the vaults that hold no position with liquidity, read per vault so the low-value ones can be stored.
async function addIdleBalances(api, { vaults, tokensOf, lowValue }) {
  if (!vaults.length) return
  const native = await api.multiCall({ target: MULTICALL3, abi: 'function getEthBalance(address addr) view returns (uint256 balance)', calls: vaults, permitFailure: true })
  const calls = vaults.flatMap(vault => tokensOf(vault).map(token => ({ target: token, params: vault })))
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true })

  const complete = []
  let offset = 0
  vaults.forEach((vault, i) => {
    const held = { [ADDRESSES.null]: native[i] }
    for (const token of tokensOf(vault)) held[token] = balances[offset++]
    // a failed read is counted as missing for this run only, and the vault is read again next run
    if (Object.values(held).some(amount => amount == null))
      Object.entries(held).forEach(([token, amount]) => { if (amount != null) api.add(token, amount) })
    else complete.push([vault, held])
  })
  await lowValue.record(complete)
}

async function tvl(api) {
  const chainConfig = config[api.chain]
  if (!chainConfig) return

  const { factory, fromBlock } = chainConfig

  const logs = await getLogs({
    api,
    target: factory,
    fromBlock,
    eventAbi: abis.vaultCreated,
    onlyArgs: true,
  })

  const allVaults = [...new Set(logs.map(i => i.vault.toLowerCase()))]
  if (!allVaults.length) return

  // The stored position lists and low-value vaults are only true for now: a run at a past block reads everything and stores nothing.
  const now = Math.floor(Date.now() / 1000)
  const isCurrentRun = !api.timestamp || api.timestamp > now - 3600
  const positionsCacheKey = `autofarm-positions/${api.chain}`
  const storedPositions = isCurrentRun ? await getCache('krystal', positionsCacheKey) : {}

  // A vault that holds no position with liquidity and next to no idle balance is stored with its balances and read again
  // once a week. Vaults go through in groups and both stores are saved after each group: a run that is cut short
  // (this adapter used to be killed before finishing) leaves the next one less to read.
  const lowValue = await getLowValueCache({ api, project: 'krystal', key: `autofarm-${api.chain}`, checkpointEvery: 1 })
  for (const vaults of sliceIntoChunks(lowValue.filter(allVaults), VAULTS_PER_GROUP)) {
    await addVaults(api, { vaults, chainConfig, lowValue, storedPositions, now })
    if (isCurrentRun) await setCache('krystal', positionsCacheKey, storedPositions)
  }
  await lowValue.save()
}

async function addVaults(api, { vaults, chainConfig, lowValue, storedPositions, now }) {
  const { uniV3Nfpms = [], slipstreamNfpms = [], farms = [], idleTokens = [] } = chainConfig

  const vaultTokens = {} // pair tokens of each vault's positions, emptied ones included
  vaults.forEach(vault => vaultTokens[vault] = new Set())
  const withLiquidity = new Set()
  const unreadable = new Set()

  const sources = [
    ...uniV3Nfpms.map(nfpm => ({ nfpm, fetcher: nfpm, kind: 'uniV3' })),
    // unstaked only - gauge-staked positions are not enumerable, see the note at the top of the file
    ...slipstreamNfpms.map(nfpm => ({ nfpm, fetcher: nfpm, kind: 'slipstream' })),
    ...farms.map(({ nfpm, nftIdFetcher }) => ({ nfpm, fetcher: nftIdFetcher, kind: 'uniV3' })),
  ]
  for (const source of sources) {
    const key = source.fetcher.toLowerCase()
    storedPositions[key] = storedPositions[key] ?? {}
    await addPositions(api, { ...source, vaults, vaultTokens, withLiquidity, unreadable, stored: storedPositions[key], now })
  }

  // Native plus the chain's major assets are checked against every vault: a vault that has exited
  // all of its positions still holds real value, and has no position to discover tokens from.
  const tokensOf = vault => [...new Set([...idleTokens, ...vaultTokens[vault]].map(token => token.toLowerCase()))]
  const everyRun = vaults.filter(vault => withLiquidity.has(vault) || unreadable.has(vault))
  await sumTokens2({ api, ownerTokens: everyRun.map(vault => [[ADDRESSES.null, ...tokensOf(vault)], vault]) })

  await addIdleBalances(api, { vaults: vaults.filter(vault => !withLiquidity.has(vault) && !unreadable.has(vault)), tokensOf, lowValue })
}

module.exports = { config, tvl }
