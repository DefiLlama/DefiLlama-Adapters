const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require("../helper/unwrapLPs");

const FlareUSDCe=ADDRESSES.rari.USDC_e;

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
