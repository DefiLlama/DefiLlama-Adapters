const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/tokenMapping')
const { getLogs } = require('../helper/cache/getLogs')
const { addUniV3LikePosition, unwrapUniswapV4NFTs, sumTokens2 } = require('../helper/unwrapLPs')
const { ethers } = require('ethers')

// MING on BSC: https://ming.family
const TREASURY = '0x427992090a24122Df5b77b5cC259804af7Ad8844' // BNB waiting for MING buybacks and staker gold
const GOLD_RESERVE = '0x2dfadF788a3eF31F6F3eAc85b2ac0339FdD535be' // the protocol's gold reserve, published at ming.family/reserve
const MING = '0x35771285a60B2aA5d4f5AcB917cc019Ee1DF7777'
const XAUT = '0x21cAef8A43163Eea865baeE23b9C2E327696A3bf'
const FROM_BLOCK = 131818665 // MING token launch
// The reserve's liquidity positions: Uniswap v4 and PancakeSwap Infinity CL cannot list a wallet's positions,
// so they are found from the position NFTs sent to the reserve; V3 position managers list them themselves
const UNISWAP_V4_POSITION_MANAGER = '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b'
const INFINITY_CL_POSITION_MANAGER = '0x55f4c8abA71A1e923edC303eb4fEfF14608cC226'

const POOL_KEY = '(address currency0, address currency1, address hooks, address poolManager, uint24 fee, bytes32 parameters)'
const abi = {
  positions: `function positions(uint256) view returns (${POOL_KEY} poolKey, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, address subscriber)`,
  ownerOf: 'function ownerOf(uint256) view returns (address)',
  getSlot0: 'function getSlot0(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
}

// Position NFTs sent to the reserve that it still holds; ownerOf reverts for a burned one, which holds nothing
async function heldPositions(api, positionManager, extraKey) {
  const logs = await getLogs({
    api, target: positionManager, fromBlock: FROM_BLOCK, onlyArgs: true, extraKey,
    eventAbi: 'event Transfer(address indexed from, address indexed to, uint256 indexed id)',
    topics: [ethers.id('Transfer(address,address,uint256)'), null, ethers.zeroPadValue(GOLD_RESERVE, 32)],
  })
  const ids = [...new Set(logs.map(l => l.id.toString()))]
  const owners = await api.multiCall({ target: positionManager, abi: abi.ownerOf, calls: ids, permitFailure: true })
  return ids.filter((_, i) => owners[i]?.toLowerCase() === GOLD_RESERVE.toLowerCase())
}

// In every position the MING side is left out: it is MING's own token
async function tvl(api) {
  await api.sumTokens({ owners: [TREASURY], tokens: [nullAddress, ADDRESSES.bsc.WBNB, XAUT] })
  await api.sumTokens({ owners: [GOLD_RESERVE], tokens: [XAUT] })

  const v4Held = await heldPositions(api, UNISWAP_V4_POSITION_MANAGER, 'ming-reserve-uniswap-v4')
  if (v4Held.length) await unwrapUniswapV4NFTs({ api, balances: api.getBalances(), owner: GOLD_RESERVE, nftAddress: UNISWAP_V4_POSITION_MANAGER, blacklistedTokens: [MING], uniV4ExtraConfig: { positionIds: v4Held } })

  const infinityHeld = await heldPositions(api, INFINITY_CL_POSITION_MANAGER, 'ming-reserve-infinity-cl')
  const positions = await api.multiCall({ target: INFINITY_CL_POSITION_MANAGER, abi: abi.positions, calls: infinityHeld })
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
