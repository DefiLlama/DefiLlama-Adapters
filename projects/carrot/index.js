const { getTokenSupplies } = require("../helper/solana");

const startTimestamp = 1723741860 // 2024-08-15
const CRT_MINT = 'CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s';
const TOKEN_MINTS = [CRT_MINT]

async function tvl(api) {
  await getTokenSupplies(TOKEN_MINTS, {api})
}

module.exports = {
  doublecounted: true,
	timetravel: true,
	start: startTimestamp,
  methodology: 'Tracks tvl via number of CRT tokens currently in circulation multiplied by the token price.',
  solana: { tvl },
}

