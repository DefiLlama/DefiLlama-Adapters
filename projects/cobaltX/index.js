
const { getConnection, sumTokens2 } = require("../helper/solana.js");
const { Connection, PublicKey, Keypair, StakeProgram, } = require("@solana/web3.js")
const { Program } = require("@coral-xyz/anchor");
const CobaltXIdl = require("./idl/amm_v3.json")

const CobaltXProgramAddress = new PublicKey("2TnjBuwqyBB9to5jURagDT7jLmBPefGRiKL2yh1zPZ4V")

// get all pool token accounts
async function getPoolTokenAccounts() {
  const connection = getConnection("soon")
  const program = new Program(
    CobaltXIdl,
    {
      connection,
    }
  );
  const data = await program.account.poolState.all()
  const tokenAccounts = data.map((item)=>([item.account.tokenVault0,item.account.tokenVault1])).flat()
  return tokenAccounts
}

module.exports = {
  bsc: {
    tvl: async (api) => {
      const poolTokenAccounts = await getPoolTokenAccounts()
      const balances = await sumTokens2({api, tokenAccounts: poolTokenAccounts})
      return balances
    },
  },
}
