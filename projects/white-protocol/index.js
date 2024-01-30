const { staking } = require("../helper/staking");
const { nullAddress } = require("../helper/unwrapLPs");


const stakingContractAddress = '0xefC170513C4026771279D453EF57cEEb66881929';
const whiteTokenAddress = '0x39B44F9C6e3ed4F1b4F7b01B9176B1F440195a2f';


module.exports = {
  op_bnb: {
    tvl: () => 0,
    staking: staking([stakingContractAddress],[whiteTokenAddress, nullAddress]),
  },
};