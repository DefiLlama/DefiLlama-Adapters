const { staking } = require("../helper/staking");

const X = "0x7f3141c4d6b047fb930991b450f1ed996a51cb26";
const veX = "0x5b8c598ef69e8eb97eb55b339a45dcf7bdc5c3a3";

module.exports = {
  methodology: `TVL for X.xyz consists of the staking of X into veX.`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(veX, X), 
  }
}