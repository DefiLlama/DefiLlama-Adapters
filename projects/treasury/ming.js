const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/tokenMapping')
const { unwrapUniswapV4NFTs, sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

// MING on BSC: https://ming.family
const TREASURY = '0x427992090a24122Df5b77b5cC259804af7Ad8844' // BNB waiting for MING buybacks and staker gold
const GOLD_RESERVE = '0x2dfadF788a3eF31F6F3eAc85b2ac0339FdD535be' // the protocol's gold reserve, published at ming.family/reserve
const MING = '0x35771285a60B2aA5d4f5AcB917cc019Ee1DF7777'
const XAUT = '0x21cAef8A43163Eea865baeE23b9C2E327696A3bf'

// The reserve's Uniswap v4 positions: the ones it held on 2026-11-08, plus any found later in Uniswap's v4 subgraph
const UNISWAP_V4_POSITION_MANAGER = '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b'
const UNISWAP_V4_SUBGRAPH = '7JTFXJdejseGj6cnTo3V3SNu2AkWyXpGieZm5NL2eYAA'
const KNOWN_V4_POSITIONS = ['1658206', '1658336', '1658371']

async function v4Positions(api) {
  const query = `query getIds($lastId: String!) {
    positions(first: 1000, where: { id_gt: $lastId, owner_in: ["${GOLD_RESERVE.toLowerCase()}"] }) { id }
  }`
  const found = await cachedGraphQuery('ming-reserve-uniswap-v4', UNISWAP_V4_SUBGRAPH, query, { fetchById: true })
  const ids = [...new Set([...KNOWN_V4_POSITIONS, ...(Array.isArray(found) ? found.map(i => i.id) : [])])]
  // ownerOf reverts for a burned position, which holds nothing; a position sent on is no longer the reserve's
  const owners = await api.multiCall({ target: UNISWAP_V4_POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  return ids.filter((_, i) => owners[i]?.toLowerCase() === GOLD_RESERVE.toLowerCase())
}

// In every position the MING side is left out: it is MING's own token
async function tvl(api) {
  await api.sumTokens({ owners: [TREASURY], tokens: [nullAddress, ADDRESSES.bsc.WBNB, XAUT] })
  await api.sumTokens({ owners: [GOLD_RESERVE], tokens: [XAUT] })
  const positionIds = await v4Positions(api)
  if (positionIds.length) await unwrapUniswapV4NFTs({ api, balances: api.getBalances(), owner: GOLD_RESERVE, nftAddress: UNISWAP_V4_POSITION_MANAGER, blacklistedTokens: [MING], uniV4ExtraConfig: { positionIds } })
  // Uniswap V3 and PancakeSwap V3 positions
  return sumTokens2({ api, owner: GOLD_RESERVE, resolveUniV3: true, blacklistedTokens: [MING] })
}

module.exports = {
  methodology: "BNB and gold in MING's Treasury contract, plus the gold (XAUt) in the protocol's reserve wallet and its liquidity positions. MING itself is not counted.",
  bsc: { tvl },
}
