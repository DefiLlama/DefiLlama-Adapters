const { aaveV3Export } = require("../helper/aave");

const CONFIG = {
  ethereum: ['0x53519c32f73fE1797d10210c4950fFeBa3b21504'],

};

module.exports = aaveV3Export(CONFIG)
