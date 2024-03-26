const { staking } = require('../helper/staking');
const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");
const contract = "0x5052FFbdfFD115842b1E368F15a1Fd6C9dA0EF28"
const BOSS = "0x49324d59327fB799813B902dB55b2a118d601547"

module.exports = {
  bsc: { tvl: sumTokensExport({ owners: [contract], tokens: [coreAssets.bsc.WBNB] }), staking: staking(contract, BOSS) }
};
