const { sumTokens2 } = require('../helper/unwrapLPs')

// Specific PancakeV3Pool addresses on BSC
const POOL_ADDRESSES = [
  '0xF5876E14580861bae291342F62C627196Fb2797C', // SPCX-USDT
  '0x79180545488B374Df89570F7676904358B7A85A9', // USDT-CRSR
  '0x8D2bb7eF6511Dd0532AE4f1DAE4a347eF69FA175', // XAI-USDT
  '0x73378B5D18eB6db99A6DFd29A17327a2D3d422CF'  // STRP-USDT
]

async function tvl(api) {
  const ownerTokens = []
  
  // Get token addresses and create ownerTokens for each pool
  for (const poolAddress of POOL_ADDRESSES) {
    const [token0, token1] = await Promise.all([
      api.call({ target: poolAddress, abi: 'address:token0' }),
      api.call({ target: poolAddress, abi: 'address:token1' }),
    ])
    
    ownerTokens.push([[token0, token1], poolAddress])
  }

  // Use sumTokens2 to calculate TVL for all pools
  return await sumTokens2({ 
    api, 
    ownerTokens 
  })
}

module.exports = {
  bsc: {
    tvl,
  },
} 