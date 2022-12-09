const { data } = require("../helper/chain/waves");
const {
  fixBalancesTokens: { waves: wavesMapping },
} = require("../helper/tokenMapping");

const wavesStakingContract = "3PDPzZVLhN1EuzGy4xAxjjTVkawKDLEaHiV";

async function wavesTVL(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const contractTVL = await data(wavesStakingContract, "STAKING_AMOUNT");
  sumSingleBalance(
    balances,
    wavesMapping.WAVES.coingeckoId,
    +contractTVL.value
  );
  return balances;
}

module.exports = {
  timetravel: false, // Waves blockchain
  methodology: "TVL of sWAVES means the quantity of WAVES tokens underlying",
  waves: {
    tvl: wavesTVL,
  },
};
