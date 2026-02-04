const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const farmContract = "0xb39EDbC5d0b23d7F4F140bBfDE92562fB1838769";
const WETH_BLXM_UNIV2 = "0xE0a97733F90d089df8EeE74a8723d96196fC4931";
const BLXM = "0x38d9eb07A7b8Df7D86F440A4A5c4a4c1a27E1a08";

const farmContract_bsc = "0xFaD010684a68AefAcF6BBe1357642c7C73a7Ed80";
const WBNB_BLXM_CakeLP = "0xD617cc09A85dC93De9FB1487ac8863936c5E511F";
const BLXM_bsc = "0x40e51e0ec04283e300f12f6bb98da157bb22036e";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(farmContract, BLXM),
    pool2: pool2(farmContract, WETH_BLXM_UNIV2),  
    tvl: (async) => ({}), 
  },
  bsc: {
    staking: staking(farmContract_bsc, BLXM_bsc),
    pool2: pool2(farmContract_bsc, WBNB_BLXM_CakeLP),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
