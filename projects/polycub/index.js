const sdk = require('@defillama/sdk')
const { yieldHelper } = require("../helper/yieldHelper");
const { staking } = require("../helper/staking");
const MASTERCHEF = "0xef79881df640b42bda6a84ac9435611ec6bb51a4";
const POLYCUB_TOKEN = "0x7cc15fef543f205bf21018f038f591c6bada941c";

module.exports = yieldHelper({
  project: 'polycub',
  chain: 'polygon',
  masterchef: MASTERCHEF,
  nativeToken: POLYCUB_TOKEN,
})

module.exports.polygon.staking = staking('0x905E21f6C4CB1Ad789CeD61CD0734590a4542346', POLYCUB_TOKEN)