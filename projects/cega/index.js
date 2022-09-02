const { Program } = require("@project-serum/anchor");
const { getProvider, transformBalances } = require("../helper/solana");
const sdk = require('@defillama/sdk')
const idl = require('./idl.json')

async function tvl() {
  const provider = getProvider()
  const programId = '3HUeooitcfKX1TSCx2xEpg2W31n6Qfmizu7nnbaEWYzs';
  const program = new Program(idl, programId, provider)
  const accounts = await program.account.vault.all()
  const balances = {}
  accounts.forEach(({ account: i}) => {
    if (!i.status.traded) return;
    sdk.util.sumSingleBalance(balances, i.underlyingMint.toString(), +i.underlyingAmount / 1e6)
  })
  return transformBalances({ tokenBalances: balances })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
