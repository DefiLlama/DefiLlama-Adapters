const ADDRESSES = require("../helper/coreAssets.json");

const { nullAddress } = require("../helper/unwrapLPs");

async function KavaTvl(api) {
  const tokens = [nullAddress, ADDRESSES.kava.USDt];
  const owners = ["0xB5CE30B6EBAA252bDEac2F768EF9b1e4Bdf8d120"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  kava: {
    tvl: KavaTvl,
  },
};
