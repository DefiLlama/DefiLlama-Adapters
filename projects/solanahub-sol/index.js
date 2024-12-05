const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('ECRqn7gaNASuvTyC5xfCUjehWZCSowMXstZiM5DNweyB', api)
}

module.exports ={
  timetravel: false,
  doublecounted: true,
  methodology: "SolanaHub Staked SOL (hubSOL) is a tokenized representation on your staked SOL + stake rewards",
  solana: { tvl },
};