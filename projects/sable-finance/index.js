const { getLiquityTvl } = require("../helper/liquity");
const { pool2 } = require("../helper/pool2");


// Contract address where view function to get total BNB collateral deposited is located
const SABLE_TROVE_MANAGER = '0xEC035081376ce975Ba9EAF28dFeC7c7A4c483B85'
// Contract address for Pool2 where SABLE-BNB LP tokens are staked
const SABLE_LP_STAKING = '0xFbc81aEB7e5c11d4A60a0690Db9F36F93E25B16C'
// Contract address for Pancake SABLE-BNB LP
const PANCAKE_SABLE_BNB = '0xa0D4e270D9EB4E41f7aB02337c21692D7eECCCB0'

module.exports = {
  bsc: {
  tvl: getLiquityTvl(SABLE_TROVE_MANAGER),
  pool2: pool2(SABLE_LP_STAKING, PANCAKE_SABLE_BNB)
}}