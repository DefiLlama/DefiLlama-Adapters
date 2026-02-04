const { staking } = require("../helper/staking");

const SOS = "0x3b484b82567a09e2588a13d54d032153f0c0aee0";
const veSOS = "0xEDd27C961CE6f79afC16Fd287d934eE31a90D7D1";

module.exports = {
  methodology: `TVL for TheOpenDAO consists of the staking of SOS into veSOS to get protocol fees.`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(veSOS, SOS), 
  }
}