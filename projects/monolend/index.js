const { aaveExports, methodology, } = require("../helper/aave");

module.exports = {
  methodology,
  polygon: aaveExports('polygon', '0x49Ce0308F3F55955D224453aECe7610b6983c123'),
};
