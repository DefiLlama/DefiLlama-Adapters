const ethers = require('ethers')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

const UNI_V4_STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b'

// First block a contract exists; calls before it revert.
const liveAt = (api, block) => api.block == null || Number(api.block) >= block

const poolId = (k) => ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
  ['address', 'address', 'uint24', 'int24', 'address'],
  [k.currency0, k.currency1, k.fee, k.tickSpacing, k.hooks],
))

// Raw Uniswap v4 PoolManager positions (no posm NFT): { key, tickLower, tickUpper, liquidity }
async function addV4Positions(api, positions) {
  if (!positions.length) return
  const slot0s = await api.multiCall({
    abi: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
    target: UNI_V4_STATE_VIEW,
    calls: positions.map((p) => poolId(p.key)),
  })
  positions.forEach((p, i) => addUniV3LikePosition({
    api, token0: p.key.currency0, token1: p.key.currency1, liquidity: p.liquidity,
    tickLower: +p.tickLower, tickUpper: +p.tickUpper, tick: +slot0s[i].tick,
  }))
}

// Drop every balance except the given tokens: the other legs are launched
// tokens whose only price source is the position itself.
function keepOnlyTokens(api, tokens) {
  const keep = new Set(tokens.map((t) => `${api.chain}:${t}`.toLowerCase()))
  api.deleteTokens(Object.keys(api.getBalances()).filter((t) => !keep.has(t.toLowerCase())))
}

module.exports = { addV4Positions, keepOnlyTokens, liveAt }
