const { sumTokens2, unwrapSlipstreamNFT, addUniV3LikePosition } = require('../helper/unwrapLPs')

// Snuggle Vaults on Base
const VAULT_V1 = '0x43Ca8D329d91ADF0aa471aC7587Aac1B2743F043'

// V2 vaults: Snuggle + MaxFi whitelabel (same contract architecture)
const BASE_VAULTS = [
  { vault: '0xd3923beccb6e1ddb048ed00a0a9bd602d16b7470', viewHelper: '0x298028007e2aeb04d787c8a8bfa03144cc976a1c' }, // Snuggle
  { vault: '0x7d27cdfbfcc878f7e7349e216d44204bfd2afd55', viewHelper: '0x286490622bcc7261c0ce794b7166dc67d3ce18bd' }, // MaxFi
]

const ARB_VAULTS = [
  { vault: '0x413Ca90D38D964546c2fE03cB103df57372630F6', viewHelper: '0x0Ef66De171293285A8f8fFD0d0D564ca093DA5b6' }, // Snuggle Arbitrum
]

// NFT Position Managers on Base
const AERO_NFT = '0x827922686190790b37229fd06084350E74485b72'
const PCS_NFT_BASE = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

// NFT Position Managers on Arbitrum
const SUSHI_NFT_ARB = '0xF0cBce1942A68BEB3d1b73F0dd86C8DCc363eF49'
const PCS_NFT_ARB = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'
const CAMELOT_NFT_ARB = '0x00c7f3082833e796A5b3e4Bd59f6642FF44DCD15'

// Position adapter addresses → DEX type (Base: Snuggle + MaxFi)
const BASE_ADAPTER_DEX = {
  // Snuggle adapters
  '0xf757c96463cb5588dc7d8eba464c947b08f33010': 'uniswap',
  '0xe3efa7825b7ace81fa2621d892d95e0048f79589': 'aerodrome',
  '0x0c0ba0b81a4ac60321c2414bdcef24c5851b39e5': 'pancakeswap',
  // MaxFi adapters
  '0xca4cf963c71234a4f7d44a750b4d3847b4debabd': 'uniswap',
  '0x0aedeed5ad8d45d3d928fb872161efaa559794d1': 'aerodrome',
  '0xad35ec92507566fc19581ab43a8ec9c6edbf0a71': 'pancakeswap',
}

// Position adapter addresses → DEX type (Arbitrum: Snuggle)
const ARB_ADAPTER_DEX = {
  '0xa6e46583b91757f50317f84349610737d9be082c': 'uniswap',
  '0x76bdb43d2ec3b190087076649224f47a58c44ef2': 'sushiswap',
  '0xf20bc2825e015be66d26b27ee82988fd4f2b84d9': 'pancakeswap',
  '0x19ec46eb3cbcec146de2d9b4336187e4f147f217': 'camelot',
}

// Camelot V3 (Algebra V1.9): 11 fields (no fee), tickLower/tickUpper/liquidity at indices 4/5/6
const algebraPositionAbi = 'function positions(uint256) view returns (uint96, address, address, address, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256, uint256, uint128, uint128)'

// Camelot V3 (Algebra V1.9): globalState() instead of slot0()
const globalStateAbi = 'function globalState() view returns (uint160 price, int24 tick)'

async function resolveVaultPositions(api, vault, viewHelper, adapterDex, chainConfig) {
  const count = await api.call({
    abi: 'function getActivePositionCount() view returns (uint256)',
    target: viewHelper,
  })
  if (!count) return

  const tokenIds = await api.multiCall({
    abi: 'function allPositionIds(uint256) view returns (uint256)',
    target: vault,
    calls: Array.from({ length: Number(count) }, (_, i) => i),
  })

  const poolIds = await api.multiCall({
    abi: 'function positions(uint256) view returns (uint256, bytes32)',
    target: vault,
    calls: tokenIds,
  })

  const uniquePoolIds = [...new Set(poolIds.map(p => p[1]))]
  const poolConfigs = await api.multiCall({
    abi: 'function approvedPools(bytes32) view returns (address, address, address, uint24, int24, bool, address)',
    target: vault,
    calls: uniquePoolIds,
  })

  const poolDex = {}
  uniquePoolIds.forEach((id, i) => {
    const adapter = poolConfigs[i][6]
    poolDex[id] = adapterDex[(adapter + '').toLowerCase()]
  })

  // Also store pool config for Camelot manual resolution
  const poolConfigMap = Object.fromEntries(uniquePoolIds.map((id, i) => [id, poolConfigs[i]]))

  const groups = { uniswap: [], aerodrome: [], pancakeswap: [], sushiswap: [], camelot: [] }
  let skipped = 0
  tokenIds.forEach((id, i) => {
    const poolId = poolIds[i][1]
    const dex = poolDex[poolId]
    if (dex && groups[dex]) {
      groups[dex].push({ tokenId: id, poolId })
    } else {
      skipped++
    }
  })
  if (skipped > 0)
    console.warn(`[snuggle] ${skipped} position(s) skipped for vault ${vault}: adapter not in adapterDex`)

  // Standard Uniswap V3 ABI positions (Uniswap, SushiSwap, PancakeSwap)
  const uniIds = groups.uniswap.map(p => p.tokenId)
  if (uniIds.length)
    await sumTokens2({ api, uniV3ExtraConfig: { positionIds: uniIds } })
  if (groups.aerodrome.length)
    await unwrapSlipstreamNFT({ api, positionIds: groups.aerodrome.map(p => p.tokenId), nftAddress: chainConfig.aeroNft })
  const pcsIds = groups.pancakeswap.map(p => p.tokenId)
  if (pcsIds.length)
    await sumTokens2({ api, uniV3ExtraConfig: { positionIds: pcsIds, nftAddress: chainConfig.pcsNft } })
  const sushiIds = groups.sushiswap.map(p => p.tokenId)
  if (sushiIds.length)
    await sumTokens2({ api, uniV3ExtraConfig: { positionIds: sushiIds, nftAddress: chainConfig.sushiNft } })

  // Camelot V3 (Algebra V1.9): manual resolution — different ABI (11 fields, no fee) and globalState() instead of slot0()
  if (groups.camelot.length) {
    const camelotTokenIds = groups.camelot.map(p => p.tokenId)
    const nftData = await api.multiCall({
      target: chainConfig.camelotNft,
      abi: algebraPositionAbi,
      calls: camelotTokenIds,
    })

    // Get pool addresses and token info for each Camelot position
    const camelotPools = groups.camelot.map(p => poolConfigMap[p.poolId])
    const uniquePools = [...new Set(camelotPools.map(c => c[0]))]
    const globalStates = await api.multiCall({
      abi: globalStateAbi,
      calls: uniquePools,
    })
    const tickMap = Object.fromEntries(uniquePools.map((pool, i) => [pool, Number(globalStates[i].tick)]))

    groups.camelot.forEach((pos, i) => {
      const { liquidity, tickLower, tickUpper } = nftData[i]
      if (liquidity == 0) return
      const config = camelotPools[i]
      addUniV3LikePosition({
        api,
        token0: config[1],
        token1: config[2],
        tick: tickMap[config[0]],
        liquidity,
        tickLower: Number(tickLower),
        tickUpper: Number(tickUpper),
      })
    })
  }
}

async function baseTvl(api) {
  // V1 vault: Uniswap V3 only, vault owns NFTs directly
  await sumTokens2({ api, owners: [VAULT_V1], resolveUniV3: true })

  // V2 vaults: enumerate positions from each vault (isolated so one failure doesn't discard the other)
  const chainConfig = { pcsNft: PCS_NFT_BASE, aeroNft: AERO_NFT }
  const results = await Promise.allSettled(BASE_VAULTS.map(({ vault, viewHelper }) => resolveVaultPositions(api, vault, viewHelper, BASE_ADAPTER_DEX, chainConfig)))
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.warn(`[snuggle] vault ${BASE_VAULTS[i].vault} failed:`, r.reason?.message ?? r.reason)
  })
}

async function arbitrumTvl(api) {
  const chainConfig = { pcsNft: PCS_NFT_ARB, sushiNft: SUSHI_NFT_ARB, camelotNft: CAMELOT_NFT_ARB }
  const results = await Promise.allSettled(ARB_VAULTS.map(({ vault, viewHelper }) => resolveVaultPositions(api, vault, viewHelper, ARB_ADAPTER_DEX, chainConfig)))
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.warn(`[snuggle] vault ${ARB_VAULTS[i].vault} failed:`, r.reason?.message ?? r.reason)
  })
}

module.exports = {
  methodology: 'TVL is the value of all concentrated liquidity positions (Uniswap V3, Aerodrome, PancakeSwap, SushiSwap, Camelot) managed by Snuggle and MaxFi (Snuggle whitelabel) vaults on Base and Arbitrum.',
  start: 1704067200,
  doublecounted: true,
  base: { tvl: baseTvl },
  arbitrum: { tvl: arbitrumTvl },
}
