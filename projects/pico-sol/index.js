const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('8Dv3hNYcEWEaa4qVx9BTN1Wfvtha1z8cWDUXb7KVACVe', api)
}

module.exports ={
  timetravel: false,
  doublecounted: true,
  methodology: "Pico Staked SOL (picoSOL) is a tokenized representation on your staked SOL + stake rewards",
  solana: { tvl },
};