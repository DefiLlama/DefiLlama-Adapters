const { wavesBalanceDetails } = require("../helper/chain/waves");
const sdk = require('@defillama/sdk')

const WXStakingNode = "3P3RZeHi4LTjpZdpw7kmkVSbQ84qDfrVy8G";

async function wavesTVL() {
  const balances = {};
  const { effective } = await wavesBalanceDetails(WXStakingNode);
  sdk.util.sumSingleBalance(balances,'waves', effective / 1e8)
  return balances;
}

module.exports = {
  timetravel: false, // Waves blockchain
  methodology: "TVL of WAVES means the quantity of staked WAVES tokens on WX node",
  waves: {
    tvl: wavesTVL,
  },
};
