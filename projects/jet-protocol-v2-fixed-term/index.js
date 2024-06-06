const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const programId = 'JPTermEg2DwrV39xb1Fs7z1VUxcvdPT7mE7cyGsQ4xt';
const idl = require('./idl.json')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, programId, provider)
  const accounts = await program.account.market.all()
  return sumTokens2({ tokenAccounts: accounts.map(i => i.account.underlyingTokenVault.toString()) })
}

module.exports = {
  methodology: 'Add all the SOL in the pools, NFT value is not included in tvl',
  timetravel: false,
  solana: {
    tvl,
  },
};
