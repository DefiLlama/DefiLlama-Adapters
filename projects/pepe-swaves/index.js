const { data } = require("../helper/chain/waves");
const sdk = require('@defillama/sdk')

const wavesStakingContract = "3PDPzZVLhN1EuzGy4xAxjjTVkawKDLEaHiV";

async function wavesTVL() {
  const balances = {};
  const contractTVLInWAVES = await data(wavesStakingContract, "STAKING_AMOUNT");
  sdk.util.sumSingleBalance(balances,'waves',contractTVLInWAVES.value/1e8)
  return balances;
}

module.exports = {
  timetravel: false, // Waves blockchain
  methodology: "TVL of sWAVES means the quantity of WAVES tokens underlying",
  waves: {
    tvl: wavesTVL,
  },
};
