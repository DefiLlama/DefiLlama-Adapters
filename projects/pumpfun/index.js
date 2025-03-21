const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const { PUMPFUN_POOL_LAYOUT } = require("../helper/utils/solana/layouts/pumpfun-layout");

const pumpfunProgram = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"

async function pumpfunTVL() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(pumpfunProgram), {
    filters: [{
      dataSize: 211
    }]
  })
  // console.log(accounts.length, 'fetched pumpfun amm pool accounts');

  let tokenAccounts = []
  for (const item of accounts) {
    const pool = PUMPFUN_POOL_LAYOUT.decode(item.account.data)
    tokenAccounts.push(pool.pool_base_token_account.toString(), pool.pool_quote_token_account.toString())
  }
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl: pumpfunTVL
  },
  methodology: 'Counts the total liquidity in all pumpfun amm pools'
};