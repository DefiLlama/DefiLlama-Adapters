const { sumTokens2, getConnection } = require('./helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Macaron Protocol Configuration
const MACARON_TOKEN = '8UiPofjkbjqTqrymz4VY3wXxMcPjFuyq3Psofekymaca'
const STAKING_ADDRESS = '7jirHCE99LM5LKDknU9d3zxpXcxGLEXrh7AkwX9AGqtY'
const POD_PROGRAM_ID = 'podGbXLgkgB3ALGsfr7rn1Ct7YJ65QSRuC5w1Zn7qAG'
const RAYDIUM_AMM_V4 = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'

// Pod Account Discriminator (first 8 bytes of account data from IDL)
const POD_DISCRIMINATOR = Buffer.from([38, 158, 247, 154, 184, 100, 20, 121])
// StakingPool Account Discriminator from IDL
const STAKING_POOL_DISCRIMINATOR = Buffer.from([203, 19, 214, 220, 220, 154, 24, 102])

async function staking(api) {
  // Track MACARON tokens staked
  await sumTokens2({
    api,
    tokensAndOwners: [[MACARON_TOKEN, STAKING_ADDRESS]],
  })
}

async function tvl(api) {
  const connection = getConnection()
  const programId = new PublicKey(POD_PROGRAM_ID)
  
  // Get all accounts from Macaron program
  const allAccounts = await connection.getProgramAccounts(programId)
  
  const lpMints = new Set() // LP mints from StakingPools
  
  // Parse each account
  for (const { pubkey, account } of allAccounts) {
    const data = account.data
    const discriminator = data.slice(0, 8)
    
    // Check if this is a Pod account
    if (discriminator.equals(POD_DISCRIMINATOR)) {
      // Parse Pod: track total_underlying
      let offset = 8 + 32 // Skip discriminator + authority
      
      // Read underlying_mint (32 bytes)
      const underlyingMint = new PublicKey(data.slice(offset, offset + 32))
      offset += 32 + 32 + 32 + 8 // Skip ptoken_mint + vault + cbr_numerator
      
      // Read total_underlying (u64 - 8 bytes)
      const totalUnderlying = data.readBigUInt64LE(offset)
      
      api.add(underlyingMint.toString(), totalUnderlying.toString())
    }
    // Check if this is a StakingPool account
    else if (discriminator.equals(STAKING_POOL_DISCRIMINATOR)) {
      // Parse StakingPool: get lp_mint
      // Structure: discriminator(8) + admin(32) + lp_mint(32) + ...
      let offset = 8 + 32 // Skip to lp_mint
      const lpMint = new PublicKey(data.slice(offset, offset + 32))
      lpMints.add(lpMint.toString())
    }
  }
  
  // Track Raydium LP pools liquidity
  if (lpMints.size > 0) {
    const raydiumProgramId = new PublicKey(RAYDIUM_AMM_V4)
    const raydiumAccounts = await connection.getProgramAccounts(raydiumProgramId, {
      filters: [{ dataSize: 752 }],
      dataSlice: { offset: 336, length: 160 } // Get baseVault(32) + quoteVault(32) + baseMint(32) + quoteMint(32) + lpMint(32)
    })
    
    const tokenAccounts = []
    
    for (const { account } of raydiumAccounts) {
      const data = account.data
      // After slice from offset 336: baseVault(0-32), quoteVault(32-64), baseMint(64-96), quoteMint(96-128), lpMint(128-160)
      const baseVault = new PublicKey(data.slice(0, 32))
      const quoteVault = new PublicKey(data.slice(32, 64))
      const lpMint = new PublicKey(data.slice(128, 160))
      
      if (lpMints.has(lpMint.toString())) {
        tokenAccounts.push(baseVault.toString())
        tokenAccounts.push(quoteVault.toString())
      }
    }
    
    // Track all vault tokens
    if (tokenAccounts.length > 0) {
      await sumTokens2({
        api,
        tokenAccounts,
      })
    }
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking,
  },
  methodology: 
    'TVL includes all underlying tokens (TKN) locked in Volatility Farming Pods. ' +
    'Each Pod wraps TKN into synthetic pTKN tokens. Users can wrap/unwrap with fees, ' +
    'and LP stakers earn rewards from these fees. The Collateral Backing Ratio (CBR) ' +
    'increases over time as fees are collected and pTKN supply is burned. ' +
    'MACARON tokens staked for governance rewards are tracked separately under "staking".'
}

