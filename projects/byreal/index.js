const { getConnection, sumTokens2, decodeAccount, } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const CLMM = 'REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2'

async function tvl() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(CLMM), {
    filters: [{
      dataSize: 1544
    }]
  })

  const data = accounts.map(i => decodeAccount('byrealCLMM', i.account))

  const tokenAccounts = data.map(i => [i.vaultA, i.vaultB]).flat().map(i => i.toString())

  return sumTokens2({ tokenAccounts })
}


module.exports = {
  timetravel: false,
  solana: { tvl },

};

