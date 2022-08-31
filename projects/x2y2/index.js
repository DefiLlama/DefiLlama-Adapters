const { staking } = require("../helper/staking");

const X2Y2 = "0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9";
const X2Y2_staking = "0xb329e39ebefd16f40d38f07643652ce17ca5bac1";
// Example X2Y2 staking tx: X2Y2 staking goes from wallet to X2Y2 FeeSharingSystem then to the 0xb329 TokenDistributor contract
// https://etherscan.io/token/0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9?a=0xb329e39ebefd16f40d38f07643652ce17ca5bac1#readContract

module.exports = {
  methodology: `TVL for X2Y2 consists of the staking of X2Y2 to receive protocol fees.`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(X2Y2_staking, X2Y2, "ethereum"), 
  }
}