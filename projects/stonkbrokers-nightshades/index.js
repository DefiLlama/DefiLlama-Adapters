const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { addV4Positions, keepOnlyTokens, liveAt } = require('../stonkbrokers/helpers')

// Nightshades (Civilization) anti-snipe launch: WETH raise escrowed in the pad
// until bond, then a protocol-owned Uniswap v4 position keyed to the faction vault.
const CIV_STACK_BLOCK = 62553796
const CIV_ANTI_SNIPE_PAD = '0xca389585c4940B107D49AF4A37aD259c5fb69081'
const CIV_FACTION_VAULT = '0xfff716727d7E80E29eab5D3498b7F28431e65C58'

const abi = {
  factionIds: 'function factionIds(uint256) view returns (bytes32)',
  faction: 'function faction(bytes32) view returns (address token, bool tokenIs0, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, int24 tickLower, int24 tickUpper)',
  positionLiquidity: 'function positionLiquidity(bytes32) view returns (uint128)',
}

async function tvl(api) {
  if (!liveAt(api, CIV_STACK_BLOCK)) return
  await sumTokens2({ api, owners: [CIV_ANTI_SNIPE_PAD, CIV_FACTION_VAULT], tokens: [ADDRESSES.robinhood.WETH] })
  const factionIds = await api.fetchList({ lengthAbi: 'uint256:factionCount', itemAbi: abi.factionIds, target: CIV_FACTION_VAULT })
  const [factions, liquidities] = await Promise.all([
    api.multiCall({ abi: abi.faction, target: CIV_FACTION_VAULT, calls: factionIds }),
    api.multiCall({ abi: abi.positionLiquidity, target: CIV_FACTION_VAULT, calls: factionIds }),
  ])
  const positions = factions.map((f, i) => ({ ...f, liquidity: Number(liquidities[i]) })).filter((p) => p.liquidity > 0)
  await addV4Positions(api, positions)
  // Faction-token legs are priced only by their own pool; keep the ETH side.
  keepOnlyTokens(api, [ADDRESSES.null, ADDRESSES.robinhood.WETH])
}

module.exports = {
  methodology:
    'TVL is the Nightshades anti-snipe launch on Robinhood Chain: the WETH raise escrowed in the anti-snipe pad before bond, the snipe-tax WETH held in the FactionLiquidityVault, and the WETH leg of each bonded faction\'s protocol-owned Uniswap v4 position. Faction-token legs are not counted.',
  doublecounted: true,
  robinhood: { start: '2026-09-14', tvl },
}
