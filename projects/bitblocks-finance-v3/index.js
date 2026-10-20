const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0xa83f730fd076574f9ad6b54af653ab9e4743d3ac'
const POSITION_MANAGER = '0x018810f07310cb73ccb9908186444bdd97ecb581'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const POSITION_ABI =
  'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)'

async function getPools(api) {
  const totalSupply = Number(await api.call({ target: POSITION_MANAGER, abi: 'uint256:totalSupply' }))
  if (!totalSupply) return []
  const tokenIds = await api.multiCall({
    target: POSITION_MANAGER,
    abi: 'function tokenByIndex(uint256 index) view returns (uint256)',
    calls: Array.from({ length: totalSupply }, (_, index) => index),
  })
  const positions = await api.multiCall({ target: POSITION_MANAGER, abi: POSITION_ABI, calls: tokenIds })
  const recipes = new Map()
  positions.forEach((position) => {
    const token0 = position.token0 || position[2]
    const token1 = position.token1 || position[3]
    const fee = position.fee ?? position[4]
    recipes.set(`${token0}:${token1}:${fee}`.toLowerCase(), { token0, token1, fee })
  })
  const uniqueRecipes = [...recipes.values()]
  const poolAddresses = await api.multiCall({
    target: FACTORY,
    abi: 'function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)',
    calls: uniqueRecipes.map(({ token0, token1, fee }) => ({ params: [token0, token1, fee] })),
  })
  return poolAddresses.flatMap((address, index) => {
    if (!address || address.toLowerCase() === ZERO_ADDRESS) return []
    return [{ ...uniqueRecipes[index], address }]
  })
}

async function tvl(api) {
  const pools = await getPools(api)
  const ownerTokens = pools.map(({ address, token0, token1 }) => [[token0, token1], address])
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  start: '2026-10-14',
  methodology: 'Counts both underlying token balances held by every BitBlocks Finance V3 pool on BNB Smart Chain. Pools are discovered on-chain from position NFTs and the V3 Factory. Position NFTs deposited in farms are not counted again.',
  bsc: { tvl },
}
