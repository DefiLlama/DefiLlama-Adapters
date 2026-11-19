const { getConnection, sumTokens2, decodeAccount } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const CLMM_PROGRAM_ID = 'SWPammPnp7L9qFgV436u3CSPmcxU6ZQm6ttawzDTRuw'

async function tvl() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(
    new PublicKey(CLMM_PROGRAM_ID),
    {
      filters: [{
        dataSize: 1544
      }]
    }
  )

  const data = accounts.map(i => decodeAccount('raydiumCLMM', i.account))

  const tokenAccounts = data
    .map(i => [i.vaultA, i.vaultB])
    .flat()
    .map(i => i.toString())

  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology: "Counts all tokens locked in swap.io CLMM pool vaults",
  solana: {
    tvl
  }
}
