const ADDRESSES = require("../helper/coreAssets.json");

const { nullAddress } = require("../helper/unwrapLPs");

async function KavaTvl(_time, _ethBlock, _cb, { api }) {
  const tokens = [nullAddress, ADDRESSES.kava.USDC];
  const owners = ["0x3d520d1979beC1E2f68B20fEcdf06AC8b543B435"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  kava: {
    tvl: KavaTvl,
  },
};
