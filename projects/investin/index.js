const { getConnection, sumTokens2, decodeAccount, } = require("../helper/solana");
const { PublicKey, } = require("@solana/web3.js");

async function tvl() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey('8dbbmZXbLsUirEsgaBVcPBEdciESza6L2zkEuer4crR'), {
    filters: [{
      dataSize: 3160
    }]
  })
  const data = accounts.map(i => decodeAccount('investinFund', i.account))
  const tokenAccounts =  data.map(i => {
    return i.tokens.filter(i => i.is_active && !i.is_on_mango && +i.balance > 1e4).map(i => i.vault.toString())
  }).flat()
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};