const ADDRESSES = require('../helper/coreAssets.json')
const JUMPBOX_TOKEN = "0x5B9957A7459347163881d19a87f6DC13291C2B07"
const WETH = ADDRESSES.optimism.WETH_1
const WRAPPER_STAKING = "0x80d25c6615ba03757619ab427c2d995d8b695162"
const UNISWAP_V3_NFT_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1"
const UNISWAP_V3_POOL = "0xe610ddc70eb7f2cff4a18d55b0cf0cef1f6e0f5f"

async function pool2(api) {
  // Get wrapper NFT balance
  const wrapperBalance = await api.call({
    target: UNISWAP_V3_NFT_MANAGER,
    abi: 'function balanceOf(address owner) view returns (uint256)',
    params: [WRAPPER_STAKING]
  })
  
  if (wrapperBalance == 0) {
    return api.getBalances()
  }
  
  // Get all token IDs
  const allTokenIds = await api.multiCall({
    target: UNISWAP_V3_NFT_MANAGER,
    abi: 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
    calls: Array.from({ length: Number(wrapperBalance) }, (_, i) => ({ params: [WRAPPER_STAKING, i] }))
  })
  
  // Get all positions
  const allPositions = await api.multiCall({
    target: UNISWAP_V3_NFT_MANAGER,
    abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
    calls: allTokenIds.map(id => ({ params: [id] }))
  })
  
  // Filter for JUMPBOX-WETH positions
  const jumpboxPositions = allPositions.filter(pos => {
    const hasJumpbox = pos.token0.toLowerCase() === JUMPBOX_TOKEN.toLowerCase() || pos.token1.toLowerCase() === JUMPBOX_TOKEN.toLowerCase()
    const hasWeth = pos.token0.toLowerCase() === WETH.toLowerCase() || pos.token1.toLowerCase() === WETH.toLowerCase()
    return hasJumpbox && hasWeth && pos.liquidity > 0
  })
  
  if (jumpboxPositions.length === 0) {
    return api.getBalances()
  }
  
  // Get pool reserves
  const [reserve0, reserve1] = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      { target: JUMPBOX_TOKEN, params: [UNISWAP_V3_POOL] },
      { target: WETH, params: [UNISWAP_V3_POOL] }
    ]
  })
  
  // Get total pool liquidity
  const poolLiquidity = await api.call({
    target: UNISWAP_V3_POOL,
    abi: 'function liquidity() view returns (uint128)',
  })
  
  // Calculate total wrapper liquidity
  const totalWrapperLiquidity = jumpboxPositions.reduce((sum, pos) => sum + BigInt(pos.liquidity), 0n)
  
  // Calculate wrapper's share of pool
  const share = Number(totalWrapperLiquidity) / Number(poolLiquidity)
  
  // Add proportional reserves
  api.add(JUMPBOX_TOKEN, Math.floor(Number(reserve0) * share))
  api.add(WETH, Math.floor(Number(reserve1) * share))
  
  return api.getBalances()
}

module.exports = {
  methodology: "TVL is calculated from the value of JUMPBOX-WETH Uniswap V3 liquidity positions held in the Rebase staking wrapper contract. Users stake V3 LP positions and earn 118% APY.",
 
  base: {
    tvl: () => ({}),
    pool2
  }
}
