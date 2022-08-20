const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const idl = require('./idl.json')

async function tvl() {
  const provider = getProvider()
  const programId = idl.metadata.address;
  const program = new Program(idl, programId, provider)
  const userAccounts = await program.account.userAccount.all()
  const ammAccounts = await program.account.ammAccount.all()
  let usdcBalance = ammAccounts.map(i => i.account.totalLiquidityUsdc).reduce((a, i) => a + (i / 1e6), 0)
  const balances = {
    'usd-coin': usdcBalance
  }
  const tokens = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',  // USDC
  ]
  const owners = userAccounts.map(i => i.publicKey)
  return sumTokens2({ balances, tokens, owners })
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
