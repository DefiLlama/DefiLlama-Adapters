const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const treasury = "0xb20234c33337537111f4ab6f5EcaD400134aC143";
const WCRO = ADDRESSES.cronos.WCRO_1;

module.exports = {
  cronos: {
    tvl: staking(treasury, WCRO),
  },
};
