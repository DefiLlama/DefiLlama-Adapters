const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, unwrapUniswapV3NFT, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

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

// Enumerate CL position ids per vault. `nftIdFetcher` is whichever contract reports ownership: the
// position manager itself for positions sitting in the vault, or a farm that has taken custody of
// the NFT but still credits the vault. Batching every vault into one balanceOf multicall keeps this
// to a handful of RPC round trips per position manager.
async function getPositionIds(api, { nftIdFetcher, owners }) {
  const counts = await api.multiCall({
    abi: 'erc20:balanceOf',
    target: nftIdFetcher,
    calls: owners,
    permitFailure: true,
  })

  const calls = []
  const callOwners = []
  counts.forEach((count, i) => {
    for (let index = 0; index < +(count ?? 0); index++) {
      calls.push({ params: [owners[i], index] })
      callOwners.push(owners[i])
    }
  })
  if (!calls.length) return []

  const tokenIds = await api.multiCall({
    abi: abis.tokenOfOwnerByIndex,
    target: nftIdFetcher,
    calls,
    permitFailure: true,
  })

  return tokenIds
    .map((tokenId, i) => tokenId == null ? null : { tokenId, owner: callOwners[i] })
    .filter(i => i)
}

async function addPositions(api, { nfpm, nftIdFetcher = nfpm, owners, kind, vaultTokens }) {
  const positionIds = await getPositionIds(api, { nftIdFetcher, owners })
  if (!positionIds.length) return

  const tokenIds = positionIds.map(i => i.tokenId)

  // Attribute each position's pair back to the vault that owns it, so the idle-balance pass below
  // only has to check the tokens a vault actually deals in rather than a chain-wide token list.
  const positions = await api.multiCall({ abi: abis.positions[kind], target: nfpm, calls: tokenIds, permitFailure: true })
  positions.forEach((position, i) => {
    if (!position) return
    const tokens = vaultTokens[positionIds[i].owner]
    tokens.add(position.token0)
    tokens.add(position.token1)
  })

  const unwrap = kind === 'slipstream' ? unwrapSlipstreamNFT : unwrapUniswapV3NFT
  await unwrap({ api, nftAddress: nfpm, positionIds: tokenIds, uniV3ExtraConfig: { positionIds: tokenIds } })
}

async function tvl(api) {
  const chainConfig = config[api.chain]
  if (!chainConfig) return

  const { factory, fromBlock, uniV3Nfpms = [], slipstreamNfpms = [], farms = [], idleTokens = [] } = chainConfig

  const logs = await getLogs({
    api,
    target: factory,
    fromBlock,
    eventAbi: abis.vaultCreated,
    onlyArgs: true,
  })

  const vaults = [...new Set(logs.map(i => i.vault.toLowerCase()))]
  if (!vaults.length) return

  // Native plus the chain's major assets are checked against every vault: a vault that has exited
  // all of its positions still holds real value, and has no position to discover tokens from.
  const vaultTokens = {}
  vaults.forEach(vault => vaultTokens[vault] = new Set([ADDRESSES.null, ...idleTokens]))

  for (const nfpm of uniV3Nfpms)
    await addPositions(api, { nfpm, owners: vaults, kind: 'uniV3', vaultTokens })

  // unstaked only - gauge-staked positions are not enumerable, see the note at the top of the file
  for (const nfpm of slipstreamNfpms)
    await addPositions(api, { nfpm, owners: vaults, kind: 'slipstream', vaultTokens })

  for (const { nfpm, nftIdFetcher } of farms)
    await addPositions(api, { nfpm, nftIdFetcher, owners: vaults, kind: 'uniV3', vaultTokens })

  await sumTokens2({ api, ownerTokens: vaults.map(vault => [[...vaultTokens[vault]], vault]) })
}

module.exports = { config, tvl }
