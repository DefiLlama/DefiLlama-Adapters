const { Program, } = require('@coral-xyz/anchor');
const iloopIdl = require('./iloop_sc_mainnet.json');
const { sumTokens2, getProvider } = require("../helper/solana");

async function tvl() {
  const provider = getProvider();
  const iloopProgram = new Program(iloopIdl, provider);
  const reserves = await iloopProgram.account.reserve.all();
  const tokenAccounts = reserves.map(({ account }) => account.liquiditySupply.toBase58());
  return sumTokens2({ tokenAccounts })
}
async function borrowed(api) {
  const provider = getProvider();
  const iloopProgram = new Program(iloopIdl, provider);
  const reserves = await iloopProgram.account.reserve.all();
  for (const { account } of reserves) {
    api.add(account.liquidityMint.toBase58(), account.borrowedAmount)
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl, borrowed,
  },
  methodology: 'TVL consists of deposits made to the protocol, borrowed tokens are not counted.',
};
