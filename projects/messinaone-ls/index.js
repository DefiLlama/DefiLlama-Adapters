const sdk = require('@defillama/sdk')
const { readGlobalState } = require("./utils");

const contractId = 1189577109
const STATE_DEPOSIT_ALGOS = "deposit_algos"

async function tvl() {
  const depositAlgos = await readGlobalState(contractId, STATE_DEPOSIT_ALGOS);
  const totalTvl = depositAlgos ? depositAlgos / 10 ** 6 : 0;
  const balances = {}
  sdk.util.sumSingleBalance(balances, "algorand", totalTvl)

  return balances
}

module.exports = {
  timetravel: false,
  methodology: "Fetches ALGOs deposited and the accumulated rewards in Messina.one's Liquid Staking Protocol",
  algorand: { tvl },
};