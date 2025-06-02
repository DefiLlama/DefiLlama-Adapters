const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, blacklistedTokens_default} = require("../helper/solana");
const idl = require('./idl.json')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'AMM55ShdkoGRB5jVYPjWziwk8m5MpwyDgsMWHaMSQWH6', provider)
  const programV2 = new Program(idl, 'CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4', provider)
  const pairs = await program.account.pool.all()
  const pairsV2 = await programV2.account.pool.all()
  const tokenAccounts = []
  const addPool = ({ account }) => {
    if (!blacklistedTokens_default.includes(account.quoteTokenMint.toString()))
      tokenAccounts.push(account.quoteTokenVault.toString())
    if (!blacklistedTokens_default.includes(account.baseTokenMint.toString()))
      tokenAccounts.push(account.baseTokenVault.toString())
  }
  pairs.forEach(addPool)
  pairsV2.forEach(addPool)
  return sumTokens2({ tokenAccounts })
}

async function staking() {
  return sumTokens2({ tokenAccounts: ['BAhtu6WzzTY72abMwNcjm8P6QvASaQNWnLY94ma69ocu'] })
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking },
  hallmarks: [
    [1665521360, "Mango Markets Hack"],
  ],
}
