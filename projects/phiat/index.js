const { staking } = require("../helper/staking");
const { methodology, aaveExports, } = require("../helper/aave");


const stakingContract = "0xeAa92F835757a8B3fA4cbCA3Db9D2Ea342651D44";
const PHIAT = "0x96e035ae0905efac8f733f133462f971cfa45db1";

module.exports = {
  methodology,
  pulse: {
    ...aaveExports(undefined, '0x9B979a359410544236343Dfa11b8e1401e4DdCd6'),
    staking: staking(stakingContract, PHIAT),
  },
};
