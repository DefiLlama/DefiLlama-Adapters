const ethers = require('ethers')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

const UNI_V4_STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b'

const liveAt = (api, block) => api.block == null || Number(api.block) >= block

const poolId = (key) => ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
  ['address', 'address', 'uint24', 'int24', 'address'],
  [key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks],
))

// Raw PoolManager positions (no posm NFT): { key, tickLower, tickUpper, liquidity }
async function addV4Positions(api, positions) {
  if (!positions.length) return
  const slot0s = await api.multiCall({
    abi: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
    target: UNI_V4_STATE_VIEW,
    calls: positions.map((position) => poolId(position.key)),
  })
  positions.forEach((position, i) => addUniV3LikePosition({
    api,
    token0: position.key.currency0,
    token1: position.key.currency1,
    liquidity: position.liquidity,
    tickLower: +position.tickLower,
    tickUpper: +position.tickUpper,
    tick: +slot0s[i].tick,
  }))
}

module.exports = { addV4Positions, liveAt }
