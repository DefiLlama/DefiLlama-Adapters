const ADDRESSES = require("../helper/coreAssets.json");

const { nullAddress } = require("../helper/unwrapLPs");

async function LineaTvl(api) {
  const tokens = [nullAddress, ADDRESSES.linea.USDC];
  const owners = ["0x00744A65cFC59ACBa312Ade7ABf77379A041Ae26"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  linea: {
    tvl: LineaTvl,
  },
};
