const { nullAddress } = require("../helper/unwrapLPs");

const FlareUSDCe="0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6";

async function FlareTvl(api) {
  const tokens = [nullAddress, FlareUSDCe];
  const owners = ["0xF59b51cB430736E0F344b0101b23981DEaE10968"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  flare: {
    tvl: FlareTvl,
  },
};
