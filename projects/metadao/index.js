const sdk = require('@defillama/sdk')
const { getProvider, sumTokens2 } = require('../helper/solana')
const { Program } = require("@project-serum/anchor")

const FUTARCHY_AMM_PROGRAM_ID = 'FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq'

async function fetchCachedTvl() {
  if (!sdk.elastic?.search) {
    return null
  }

  try {
    const cachedLog = await sdk.elastic.search({
      index: 'custom-scripts*',
      body: {
        query: {
          bool: {
            must: [
              { match: { project: 'metadao/futarchy-dao-treasuries' } },
              { match: { chain: 'solana' } },
              { match: { 'metadata.type': 'tvl' } },
              {
                range: {
                  timestamp: {
                    gte: Math.floor(Date.now() / 1000) - 24 * 60 * 60,
                  },
                },
              },
            ],
          },
        },
        sort: [{ timestamp: { order: 'desc' } }],
        size: 1,
      },
    })

    if (cachedLog?.hits?.hits?.length > 0) {
      return cachedLog.hits.hits[0]._source.balances
    }
  } catch (e) {
    console.log("Error fetching cached TVL:", e.message)
  }
  return null
}

async function getAllDaos() {
  const provider = getProvider()
  const idl = await Program.fetchIdl(FUTARCHY_AMM_PROGRAM_ID, provider)
  const program = new Program(idl, FUTARCHY_AMM_PROGRAM_ID, provider)
  const data = await program.account.dao.all()

  return data
    .filter(d => d.account.squadsMultisigVault)
    .map(d => ({
      daoAddress: d.publicKey.toString(),
      treasuryVaultAddress: d.account.squadsMultisigVault.toString(),
    }))
}

async function tvlFallback(api) {
  const daos = await getAllDaos()
  
  // Collect all addresses to query:
  // 1. DAO addresses (hold AMM token balances)
  // 2. Treasury vault addresses (hold treasury balances)
  const owners = []
  
  daos.forEach(dao => {
    owners.push(dao.daoAddress)           // AMM balances
    owners.push(dao.treasuryVaultAddress) // Treasury balances
  })
  
  console.log(`Querying ${owners.length} addresses (${daos.length} DAOs + ${daos.length} treasuries)`)
  
  return sumTokens2({ api, owners })
}

async function tvl(api) {
  // Try cached data first (includes LP positions from custom script)
  const cachedBalances = await fetchCachedTvl()
  if (cachedBalances) {
    return cachedBalances
  }

  // Fallback: query DAO + treasury addresses directly
  console.log("No cached TVL found, calculating fallback...")
  return tvlFallback(api)
}

module.exports = {
  timetravel: false,
  methodology: "Assets Under Futarchy (AUF): Sum of all Futarchy DAO treasury balances (from Squads vaults) plus Futarchy AMM liquidity (from DAO addresses). Each DAO using MetaDAO governance has both treasury holdings and AMM pools.",
  solana: {
    tvl,
  },
}
