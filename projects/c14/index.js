const { aaveExports } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

module.exports = {
  methodology: methodologies.lendingMarket,
  astrzk: aaveExports('astrzk', "0x12922D7d8762090Cb27E7e1e824EC9c373664704", undefined, ['0x7B47bfB3F6C4ff74bb39395676759d4aFbD9f071'], { v3: true }),
}