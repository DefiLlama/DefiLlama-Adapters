const COLLATERAL_REGISTRY = '0xCFf0DcAb01563e5324ef9D0AdB0677d9C167d791'

const USDAF_TOKEN = '0x85e30b8b263bc64d94b827ed450f2edfee8579da'

const STABILITY_POOLS = [
  '0x0b656b3af27e3a9cf143d16ed46466e0be27fecc',
  '0xd95692af0a30d936287bc7dc3837d3fbf7415f8a',
  '0x6f35f38d93165b67edc6abcd4b8ac5fef5ea86e0',
  '0x001fdd4f3405f97ed61c7dc817208dfeb8f6cb70',
  '0x38b5c7a506fff3d3dafd2d013e969d6e99cd9b73',
  '0x76365e44314c048a924314c3bd9bf59d6fa9e243',
  '0xe9a258f362fc7f8003a39b087046f64815cc9c56',
  '0x7f5d15f4053f1e34025907f0741f2abc4353c65c'
]

async function tvl(api) {
  // Custom implementation of getLiquityV2Tvl with token substitutions to handle wrapped collateral tokens
  const troves = await api.fetchList({ 
    lengthAbi: 'totalCollaterals', 
    itemAbi: 'getTroveManager', 
    target: COLLATERAL_REGISTRY 
  })
  const activePools = await api.multiCall({ abi: 'address:activePool', calls: troves })
  const defaultPools = await api.multiCall({ abi: 'address:defaultPoolAddress', calls: activePools })
  const tokens = await api.multiCall({ abi: 'address:collToken', calls: activePools })
  
  // Token substitution mapping
  // These wrappers contracts mint wrapped tokens 1:1 from original token deposits, scaling up to 18 token decimals (1e8 WBTC = 1e18 Wrapped WBTC)
  const tokenSubstitutions = {
    'Wrapped WBTC': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    'Wrapped cbBTC': '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'
  }
  
  // Get token names to check for substitutions
  const tokenNames = await api.multiCall({ 
    abi: 'string:name', 
    calls: tokens,
  })
  
  // Prepare arrays for normal tokens and special handling
  const normalTokens = []
  const normalOwners = []
  
  // Process each token and handle substitutions
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const tokenName = tokenNames[i]
    const activePool = activePools[i]
    const defaultPool = defaultPools[i]
    
    if (tokenName && tokenSubstitutions[tokenName]) {
      // Handle wrapped tokens with substitution and balance adjustment
      const substitutedToken = tokenSubstitutions[tokenName]
      
      // Get balances for the wrapped token
      const activePoolBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: [activePool]
      })
      const defaultPoolBalance = await api.call({
        abi: 'erc20:balanceOf', 
        target: token,
        params: [defaultPool]
      })
      
      // Add balances divided by 10**10 for the substituted token
      api.add(substitutedToken, activePoolBalance / 1e10)
      api.add(substitutedToken, defaultPoolBalance / 1e10)
    } else {
      // Add to normal processing
      normalTokens.push(token, token)
      normalOwners.push(activePool, defaultPool)
    }
  }
  
  // Process normal tokens if any
  if (normalTokens.length > 0) {
    await api.sumTokens({ tokensAndOwners2: [normalTokens, normalOwners] })
  }

  // Add USDAF balances in stability pools
  await api.sumTokens({
    tokensAndOwners: STABILITY_POOLS.map(pool => [USDAF_TOKEN, pool]),
  })
}

module.exports = {
  methodology: 'TVL counts all assets deposited as collateral and USDAF in the stability pools',
  ethereum: {
    tvl,
  },
  misrepresentedTokens: true,
}