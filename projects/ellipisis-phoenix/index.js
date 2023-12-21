const { sumTokens2, getConnection, decodeAccount, } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

async function tvl() {
  const program = new PublicKey('PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY')
  const connection = getConnection();
  const accounts0 = await connection.getProgramAccounts(program, {
    filters: [{
      dataSize: 445536
    }]
  })
  const accounts1 = await connection.getProgramAccounts(program, {
    filters: [{
      dataSize: 1723488
    }]
  })
  const accounts = [...accounts0, ...accounts1]
  const tokenAccounts = accounts.map(i => decodeAccount('phoenix', i.account))
  .map(i => [i.baseParams.vaultKey, i.quoteParams.vaultKey]).flat()
  return sumTokens2({ tokenAccounts, })
}

module.exports = {
  timetravel: false,
  solana: { tvl },
}
