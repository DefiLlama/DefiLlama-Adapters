const { sumTokens2, getConnection } = require('./helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Macaron Protocol Configuration
const MACARON_TOKEN = '8UiPofjkbjqTqrymz4VY3wXxMcPjFuyq3Psofekymaca'
const STAKING_ADDRESS = '7jirHCE99LM5LKDknU9d3zxpXcxGLEXrh7AkwX9AGqtY'
const POD_PROGRAM_ID = 'podGbXLgkgB3ALGsfr7rn1Ct7YJ65QSRuC5w1Zn7qAG'

// Pod Account Discriminator (first 8 bytes of account data from IDL)
const POD_DISCRIMINATOR = Buffer.from([38, 158, 247, 154, 184, 100, 20, 121])

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
  
  // Get all Pod accounts
  const allAccounts = await connection.getProgramAccounts(programId)
  
  // Parse Pod accounts to track underlying tokens
  for (const { account } of allAccounts) {
    const data = account.data
    const discriminator = data.slice(0, 8)
    
    if (!discriminator.equals(POD_DISCRIMINATOR)) continue
    
    // Parse Pod: track total_underlying
    let offset = 8 + 32 // Skip discriminator + authority
    
    // Read underlying_mint (32 bytes)
    const underlyingMint = new PublicKey(data.slice(offset, offset + 32))
    offset += 32 + 32 + 32 + 8 // Skip ptoken_mint + vault + cbr_numerator
    
    // Read total_underlying (u64 - 8 bytes)
    const totalUnderlying = data.readBigUInt64LE(offset)
    
    api.add(underlyingMint.toString(), totalUnderlying.toString())
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking,
  },
  methodology: 
    'TVL tracks underlying tokens locked in Volatility Farming Pods. ' +
    'Pods wrap TKN into pTKN with Collateral Backing Ratio (CBR) mechanism. ' +
    'MACARON tokens staked for governance are tracked separately under "staking".'
}