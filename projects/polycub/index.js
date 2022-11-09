
const { yieldHelper } = require("../helper/yieldHelper");
const MASTERCHEF = "0xef79881df640b42bda6a84ac9435611ec6bb51a4";
const POLYCUB_TOKEN = "0x7cc15fef543f205bf21018f038f591c6bada941c";

module.exports = yieldHelper({
  project: 'polycub',
  chain: 'polygon',
  masterchef: MASTERCHEF,
  nativeToken: POLYCUB_TOKEN,
})