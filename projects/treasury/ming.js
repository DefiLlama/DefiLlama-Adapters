const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/tokenMapping')
const { addUniV3LikePosition, unwrapUniswapV4NFTs, sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const { ethers } = require('ethers')

// MING on BSC: https://ming.family
const TREASURY = '0x427992090a24122Df5b77b5cC259804af7Ad8844' // BNB waiting for MING buybacks and staker gold
const GOLD_RESERVE = '0x2dfadF788a3eF31F6F3eAc85b2ac0339FdD535be' // the protocol's gold reserve, published at ming.family/reserve
const MING = '0x35771285a60B2aA5d4f5AcB917cc019Ee1DF7777'
const XAUT = '0x21cAef8A43163Eea865baeE23b9C2E327696A3bf'

// The reserve's liquidity positions are listed by MING's API, which follows every position NFT sent to the
// reserve; only the list comes from it, and every amount below is read on chain. The positions held on
// 2026-11-08 are kept here too, in case the API cannot be reached.
const RESERVE_API = 'https://core.ming.family/v1/reserve'
const UNISWAP_V4_POSITION_MANAGER = '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b'
const INFINITY_CL_POSITION_MANAGER = '0x55f4c8abA71A1e923edC303eb4fEfF14608cC226'
const KNOWN_POSITIONS = { 'uniswap-v4': ['1658206', '1658336', '1658371'], 'pancakeswap-infinity': [] }

const POOL_KEY = '(address currency0, address currency1, address hooks, address poolManager, uint24 fee, bytes32 parameters)'
const abi = {
  ownerOf: 'function ownerOf(uint256) view returns (address)',
  infinityPositions: `function positions(uint256) view returns (${POOL_KEY} poolKey, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, address subscriber)`,
  getSlot0: 'function getSlot0(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
}

async function listedPositions() {
  const { positions = [] } = await getConfig('ming-reserve-positions', RESERVE_API)
  const ids = { 'uniswap-v4': [...KNOWN_POSITIONS['uniswap-v4']], 'pancakeswap-infinity': [...KNOWN_POSITIONS['pancakeswap-infinity']] }
  for (const p of positions) if (ids[p.venue] && p.nft?.id != null) ids[p.venue].push(String(p.nft.id))
  return { uniswapV4: [...new Set(ids['uniswap-v4'])], infinity: [...new Set(ids['pancakeswap-infinity'])] }
}

// Only positions the reserve still holds: ownerOf reverts for a burned one, which holds nothing
async function held(api, positionManager, ids) {
  const owners = await api.multiCall({ target: positionManager, abi: abi.ownerOf, calls: ids, permitFailure: true })
  return ids.filter((_, i) => owners[i]?.toLowerCase() === GOLD_RESERVE.toLowerCase())
}

// In every position the MING side is left out: it is MING's own token
async function tvl(api) {
  await api.sumTokens({ owners: [TREASURY], tokens: [nullAddress, ADDRESSES.bsc.WBNB, XAUT] })
  await api.sumTokens({ owners: [GOLD_RESERVE], tokens: [XAUT] })
  const listed = await listedPositions()

  const v4 = await held(api, UNISWAP_V4_POSITION_MANAGER, listed.uniswapV4)
  if (v4.length) await unwrapUniswapV4NFTs({ api, balances: api.getBalances(), owner: GOLD_RESERVE, nftAddress: UNISWAP_V4_POSITION_MANAGER, blacklistedTokens: [MING], uniV4ExtraConfig: { positionIds: v4 } })

  const infinity = await held(api, INFINITY_CL_POSITION_MANAGER, listed.infinity)
  const positions = await api.multiCall({ target: INFINITY_CL_POSITION_MANAGER, abi: abi.infinityPositions, calls: infinity })
  const notMing = { add: (token, amount) => { if (token.toLowerCase() !== MING.toLowerCase()) api.add(token, amount) } }
  for (const { poolKey, tickLower, tickUpper, liquidity } of positions) {
    const poolId = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['address', 'address', 'address', 'address', 'uint24', 'bytes32'], [poolKey.currency0, poolKey.currency1, poolKey.hooks, poolKey.poolManager, poolKey.fee, poolKey.parameters]))
    const { tick } = await api.call({ target: poolKey.poolManager, abi: abi.getSlot0, params: [poolId] })
    addUniV3LikePosition({ api: notMing, token0: poolKey.currency0, token1: poolKey.currency1, liquidity: Number(liquidity), tickLower: Number(tickLower), tickUpper: Number(tickUpper), tick: Number(tick) })
  }

  // Uniswap V3 and PancakeSwap V3 positions
  return sumTokens2({ api, owner: GOLD_RESERVE, resolveUniV3: true, blacklistedTokens: [MING] })
}

module.exports = {
  methodology: "BNB and gold in MING's Treasury contract, plus the gold (XAUt) in the protocol's reserve wallet and its liquidity positions. MING itself is not counted.",
  bsc: { tvl },
}
