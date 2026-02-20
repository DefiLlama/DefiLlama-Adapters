const { sumTokens2, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

// Snuggle Vaults on Base
const VAULT_V1 = '0x43Ca8D329d91ADF0aa471aC7587Aac1B2743F043'
const VAULT_V2 = '0xd3923beccb6e1ddb048ed00a0a9bd602d16b7470'
const VIEW_HELPER = '0x298028007e2aeb04d787c8a8bfa03144cc976a1c'

// NFT Position Managers on Base
const AERO_NFT = '0x827922686190790b37229fd06084350E74485b72'
const PCS_NFT = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

// Snuggle position adapter addresses → DEX type
const ADAPTER_DEX = {
  '0xf757c96463cb5588dc7d8eba464c947b08f33010': 'uniswap',
  '0xe3efa7825b7ace81fa2621d892d95e0048f79589': 'aerodrome',
  '0x0c0ba0b81a4ac60321c2414bdcef24c5851b39e5': 'pancakeswap',
}

async function tvl(api) {
  // V1 vault: Uniswap V3 only, vault owns NFTs directly
  await sumTokens2({ api, owners: [VAULT_V1], resolveUniV3: true })

  // V2 vault: Uniswap V3 + Aerodrome + PancakeSwap
  // Positions may be staked in gauges/MasterChef (not owned by vault),
  // so we read position IDs from the vault and resolve by ID directly
  const count = await api.call({
    abi: 'function getActivePositionCount() view returns (uint256)',
    target: VIEW_HELPER,
  })
  if (!count) return

  // Read all position IDs from vault
  const tokenIds = await api.multiCall({
    abi: 'function allPositionIds(uint256) view returns (uint256)',
    target: VAULT_V2,
    calls: Array.from({ length: Number(count) }, (_, i) => i),
  })

  // Get poolId for each position (2nd field of UserPosition struct)
  const poolIds = await api.multiCall({
    abi: 'function positions(uint256) view returns (uint256, bytes32)',
    target: VAULT_V2,
    calls: tokenIds,
  })

  // Get position adapter for each unique pool (7th field of PoolConfig struct)
  const uniquePoolIds = [...new Set(poolIds.map(p => p[1]))]
  const poolConfigs = await api.multiCall({
    abi: 'function approvedPools(bytes32) view returns (address, address, address, uint24, int24, bool, address)',
    target: VAULT_V2,
    calls: uniquePoolIds,
  })

  // Map poolId → DEX type via adapter address
  const poolDex = {}
  uniquePoolIds.forEach((id, i) => {
    const adapter = poolConfigs[i][6] || poolConfigs[i].positionAdapter
    poolDex[id] = ADAPTER_DEX[(adapter + '').toLowerCase()]
  })

  // Group token IDs by DEX
  const groups = { uniswap: [], aerodrome: [], pancakeswap: [] }
  tokenIds.forEach((id, i) => {
    const poolId = poolIds[i][1] || poolIds[i].poolId
    const dex = poolDex[poolId]
    if (groups[dex]) groups[dex].push(id)
  })

  // Resolve positions by ID — bypasses NFT ownership check, works for staked positions
  if (groups.uniswap.length)
    await sumTokens2({ api, uniV3ExtraConfig: { positionIds: groups.uniswap } })
  if (groups.aerodrome.length)
    await unwrapSlipstreamNFT({ api, positionIds: groups.aerodrome, nftAddress: AERO_NFT })
  if (groups.pancakeswap.length)
    await sumTokens2({ api, uniV3ExtraConfig: { positionIds: groups.pancakeswap, nftAddress: PCS_NFT } })
}

module.exports = {
  methodology: 'TVL is the value of all concentrated liquidity positions (Uniswap V3, Aerodrome, PancakeSwap) managed by the Snuggle vault.',
  start: 1704067200,
  doublecounted: true,
  base: { tvl },
}
