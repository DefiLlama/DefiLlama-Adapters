const { sumTokens2, getConnection } = require('./helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Macaron Protocol Configuration
const MACARON_TOKEN = '8UiPofjkbjqTqrymz4VY3wXxMcPjFuyq3Psofekymaca'
const STAKING_ADDRESS = '7jirHCE99LM5LKDknU9d3zxpXcxGLEXrh7AkwX9AGqtY'
const POD_PROGRAM_ID = 'podGbXLgkgB3ALGsfr7rn1Ct7YJ65QSRuC5w1Zn7qAG'

// Raydium LP Pool Vaults - hardcoded because Raydium program is excluded from secondary indexes on DefiLlama RPC
const POOL_VAULTS = [
  'J9gBqx5sxjR4cdivEPJ8YumSNdBU3qACygtuJekHEjKJ', '2AR7dELspiHqczdntAFKHYmKzYbBJuw9tKjYxYbrXzcb',
  '3GYesNsJDKP5tfQYdYHFGARY1WHHeYgZ1fVi5RLCau4Q', 'HzsN8ctWK91gw1oBzFXQiR9MMyMazX55GCg1ptTacXHE',
  '8szkgjHEXXHpBFans1WYz4cNBVM5GndrEVHkgopRhMVK', 'DtvKv1JYmHbg6rFYAFtQWFzbmgCDVtii5XqPfbEi8qte',
  '9G9dhMPbiXNpKbLyifGkYSJJBPbM82thEy8BwCo8f5Ct', '6YjDAJpsuxwpxNGuEKH6GCpWpLgKrkqGujYVYxqTB2Nf',
  '264ZQN6ixkD6pcTLjSmyqjZghpsxTfLpJSvwB3GYHVKQ', 'ZwExxbDxTrz9A81pBj1DLvuihY8Pkp2XytoUQLqiV1b',
  'Etq6HrUKRMRRv29mTR82uV33J2gYWeptmdjq6AmqiR4C', '7ni5apRMTBrhEhGk9K5aiRHWRSVt2Er6FoGdtGfWgih8',
  'HFgAXyyKTh3tup3c2QNUQaGe6rrFhgmv8nvMhYs1KwuA', 'EKENmeoaeqqsmTyp6xrAEJ16UGpbQnnpZnpN5MYZX6K6',
  '8ChJLAhS8zQLgf6RjsqeVPxHitxwTbARPwVFLTK1oRTN', '2vNmCcmA8WNskEJWi35vnV4pYKNVce4dHjWxHFrPNfP4',
  'A9Qq72WJM6iEjHctt7N89c5DTZbntwiFomJUqE7GqZ2K', 'HHXptF9xbeRtwSX3WiaVGXMh8Bjm4iZFcBnR3puRnwrd',
  '6341VTWY3sfX9pFQUmrkfKtCLthWeAExs2ctPsADMv3R', '2xd6W24TAh6y9jkiwGou8ZtiDoaYk8W11aZ9NdoeB9NP',
  'DoWJ1WyEnamSZn8u2RxskMePaUscwhDRFwY7F81KMGea', 'qepkKWamjHfvFe4ZXXrzTvp7VYCBbWWKFX9CgedMVPZ',
]

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
  
  // Track Raydium LP pool reserves
  const tokenAccounts = POOL_VAULTS
  await sumTokens2({
    api,
    tokenAccounts,
  })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking,
  },
  methodology: 
    'TVL tracks underlying tokens locked in Volatility Farming Pods plus reserves in Raydium LP pools. ' +
    'Pods wrap TKN into pTKN with Collateral Backing Ratio (CBR) mechanism. ' +
    'MACARON tokens staked for governance are tracked separately under "staking".'
}