const { getAppGlobalState } = require("../helper/chain/algorand");

const contractId = 1189577109
const STATE_DEPOSIT_ALGOS = "deposit_algos"

async function tvl() {
  const state = await getAppGlobalState(contractId);
  return {
    algorand: state[STATE_DEPOSIT_ALGOS]/1e6
  }
}

module.exports = {
  timetravel: false,
  methodology: "Fetches ALGOs deposited and the accumulated rewards in Messina.one's Liquid Staking Protocol",
  algorand: { tvl },
};