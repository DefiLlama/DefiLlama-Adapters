const { aaveV2Export, methodology } = require("../helper/aave")

module.exports = {
  methodology,
  somnia: aaveV2Export('0xEC6758e6324c167DB39B6908036240460a2b0168', { isAaveV3Fork: true }),
}