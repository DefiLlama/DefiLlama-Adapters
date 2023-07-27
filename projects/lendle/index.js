const { aaveV2Export } = require("../helper/aave");

module.exports = {
  mantle: aaveV2Export('0x30D990834539E1CE8Be816631b73a534e5044856', { fromBlock: 56556, })
};