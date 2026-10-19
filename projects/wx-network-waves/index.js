const { wavesBalanceDetails } = require("../helper/chain/waves");

const WXStakingNode = "3P3RZeHi4LTjpZdpw7kmkVSbQ84qDfrVy8G";

async function wavesTVL(api) {
  const { effective } = await wavesBalanceDetails(WXStakingNode);
  api.addCGToken('waves', effective / 1e8)
}

module.exports = {
  timetravel: false, // Waves blockchain
  methodology: "TVL of WAVES means the quantity of staked WAVES tokens on WX node",
  waves: {
    tvl: wavesTVL,
  },
};
