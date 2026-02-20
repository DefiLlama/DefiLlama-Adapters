const { sumTokens2, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

// Snuggle Vaults on Base
const VAULT_V1 = '0x43Ca8D329d91ADF0aa471aC7587Aac1B2743F043'

// V2 vaults: Snuggle + MaxFi whitelabel (same contract architecture)
const VAULTS = [
  { vault: '0xd3923beccb6e1ddb048ed00a0a9bd602d16b7470', viewHelper: '0x298028007e2aeb04d787c8a8bfa03144cc976a1c' }, // Snuggle
  { vault: '0x7d27cdfbfcc878f7e7349e216d44204bfd2afd55', viewHelper: '0x286490622bcc7261c0ce794b7166dc67d3ce18bd' }, // MaxFi
]

// NFT Position Managers on Base
const AERO_NFT = '0x827922686190790b37229fd06084350E74485b72'
const PCS_NFT = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

// Position adapter addresses → DEX type (Snuggle + MaxFi deployments)
const ADAPTER_DEX = {
  // Snuggle adapters
  '0xf757c96463cb5588dc7d8eba464c947b08f33010': 'uniswap',
  '0xe3efa7825b7ace81fa2621d892d95e0048f79589': 'aerodrome',
  '0x0c0ba0b81a4ac60321c2414bdcef24c5851b39e5': 'pancakeswap',
  // MaxFi adapters
  '0xca4cf963c71234a4f7d44a750b4d3847b4debabd': 'uniswap',
  '0x0aedeed5ad8d45d3d928fb872161efaa559794d1': 'aerodrome',
  '0xad35ec92507566fc19581ab43a8ec9c6edbf0a71': 'pancakeswap',
}

async function resolveVaultPositions(api, vault, viewHelper) {
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
    const adapter = poolConfigs[i][6] || poolConfigs[i].positionAdapter
    poolDex[id] = ADAPTER_DEX[(adapter + '').toLowerCase()]
  })

  const groups = { uniswap: [], aerodrome: [], pancakeswap: [] }
  tokenIds.forEach((id, i) => {
    const poolId = poolIds[i][1] || poolIds[i].poolId
    const dex = poolDex[poolId]
    if (groups[dex]) groups[dex].push(id)
  })

  if (groups.uniswap.length)
    await sumTokens2({ api, uniV3ExtraConfig: { positionIds: groups.uniswap } })
  if (groups.aerodrome.length)
    await unwrapSlipstreamNFT({ api, positionIds: groups.aerodrome, nftAddress: AERO_NFT })
  if (groups.pancakeswap.length)
    await sumTokens2({ api, uniV3ExtraConfig: { positionIds: groups.pancakeswap, nftAddress: PCS_NFT } })
}

async function tvl(api) {
  // V1 vault: Uniswap V3 only, vault owns NFTs directly
  await sumTokens2({ api, owners: [VAULT_V1], resolveUniV3: true })

  // V2 vaults: enumerate positions from each vault
  for (const { vault, viewHelper } of VAULTS) {
    await resolveVaultPositions(api, vault, viewHelper)
  }
}

module.exports = {
  methodology: 'TVL is the value of all concentrated liquidity positions (Uniswap V3, Aerodrome, PancakeSwap) managed by Snuggle vaults.',
  start: 1704067200,
  doublecounted: true,
  base: { tvl },
}
