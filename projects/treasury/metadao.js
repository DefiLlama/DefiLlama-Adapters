const { sumTokens2, getConnection, getProvider } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { Program } = require("@project-serum/anchor")

// MetaDAO-specific treasury wallets
const METADAO_TREASURIES = [
  'BfzJzFUeE54zv6Q2QdAZR4yx7UXuYRsfkeeirrRcxDvk', // Primary treasury
  '6awyHMshBGVjJ3ozdSJdyyDE1CTAXUwrpNMaRGMsb4sf', // Secondary treasury
]

// MetaDAO's DAO address on Futarchy (to find LP positions)
const METADAO_DAO_ADDRESS = 'BxgkvRwqzYFWuDbRjfTYfgTtb41NaFw1aQ3129F79eBT'

const FUTARCHY_AMM_PROGRAM_ID = 'FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq'

const TOKEN_PROGRAM_IDS = [
  new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
]

async function getMetaDaoLpPositions() {
  // MetaDAO's LP positions in their own AMM (if any)
  // Based on Dune data, MetaDAO has lp_total_value: 0
  // But we'll check for any AMM vaults associated with MetaDAO's DAO
  try {
    const provider = getProvider()
    const idl = await Program.fetchIdl(FUTARCHY_AMM_PROGRAM_ID, provider)
    const program = new Program(idl, FUTARCHY_AMM_PROGRAM_ID, provider)
    
    const daoAccount = await program.account.dao.fetch(new PublicKey(METADAO_DAO_ADDRESS))
    
    if (daoAccount?.amm?.ammBaseVault && daoAccount?.amm?.ammQuoteVault) {
      return [
        daoAccount.amm.ammBaseVault.toString(),
        daoAccount.amm.ammQuoteVault.toString(),
      ]
    }
  } catch (e) {
    console.log("Error fetching MetaDAO LP positions:", e.message)
  }
  return []
}

async function tvl() {
  const connection = getConnection()
  const tokenAccounts = []

  // Fetch token accounts from MetaDAO treasury wallets
  for (const vault of METADAO_TREASURIES) {
    for (const programId of TOKEN_PROGRAM_IDS) {
      try {
        const resp = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(vault),
          { programId }
        )
        tokenAccounts.push(...resp.value.map(acc => acc.pubkey.toString()))
      } catch (e) {
        console.log("Treasury fetch error:", vault, e.message)
      }
    }
  }

  // Get MetaDAO's LP positions (AMM vaults)
  const lpAccounts = await getMetaDaoLpPositions()

  return sumTokens2({
    chain: 'solana',
    tokenAccounts: [...tokenAccounts, ...lpAccounts],
  })
}

module.exports = {
  timetravel: false,
  methodology: "MetaDAO Treasury: Token holdings in MetaDAO's treasury wallets plus any Futarchy AMM LP positions owned by MetaDAO specifically.",
  solana: {
    tvl,
  },
}
