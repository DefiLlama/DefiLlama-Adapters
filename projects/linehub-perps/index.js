const ADDRESSES = require("../helper/coreAssets.json");

const { nullAddress } = require("../helper/unwrapLPs");

async function LineaTvl(api) {
  const tokens = [nullAddress, ADDRESSES.linea.USDC];
  const owners = ["0xC94cFd8F4fB8Ef3EB360Ec92e2A9Ca969Cadf095", "0x00744A65cFC59ACBa312Ade7ABf77379A041Ae26"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  linea: {
    tvl: LineaTvl,
  },
};
