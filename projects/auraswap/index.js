const { uniTvlExport } = require('../helper/calculateUniTvl.js');
const { staking } = require("../helper/staking.js");

const AURA_TOKEN = '0x1b7805e2829fd7D194DCc3078a4199b13c77E467'
const MASTER_CHEF = '0x44Bb1a3E56Cb12b7B1a8E925f09A170e3646346d'
const FACTORY_POLYGON = "0x015DE3ec460869eb5ceAe4224Dc7112ac0a39303";

module.exports = {
  polygon: {
    tvl: uniTvlExport(FACTORY_POLYGON, 'polygon', true),
    staking: staking(MASTER_CHEF, AURA_TOKEN),
  },
}