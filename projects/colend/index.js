const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  core: aaveExports('core', '0xC3F120f418f9541263eA3F4a5a4120eb3f28EfA1', undefined, ['0x567AF83d912C85c7a66d093e41D92676fA9076E3'], { v3: true, }),
};
