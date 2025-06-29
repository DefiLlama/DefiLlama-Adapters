const { getConnection, sumTokens2, decodeAccount, } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const CLMM = 'REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2'

async function tvlCLMM() {
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

async function combinedTvl(api) {
    const balancesCLMM = await tvlCLMM()
    api.addBalances(balancesCLMM);
    return api.getBalances();
}

module.exports = {
  timetravel: false,
  solana: { tvl: combinedTvl },
  
};

