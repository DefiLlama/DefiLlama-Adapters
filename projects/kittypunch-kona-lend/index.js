const { aaveV3Export } = require("../helper/aave");

// https://kittypunch.gitbook.io/kittypunch-docs/protocols-and-products-abstract/kona-lend
// Protocol Data Provider
const CONFIG = {
  abstract: [
    '0xDfc422c8793864ecD12Bc59F2024614034BcB078'
  ],
};

module.exports = aaveV3Export(CONFIG)
