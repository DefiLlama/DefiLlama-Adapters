const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const LOOKS = "0xf4d2888d29D722226FafA5d9B24F9164c092421E";
const stkLOOKS = "0xa35dce3e0e6ceb67a30b8d7f4aee721c949b5970";
const LOOKS_ETH_univ2 = '0xdc00ba87cc2d99468f7f34bc04cbf72e111a32f7'
const LOOKS_ETH_univ2_staking = '0x2a70e7f51f6cd40c3e9956aa964137668cbfadc5'

module.exports = {
  methodology: `TVL for LOOKS.RARE consists of the staking of LOOKS and pool2 of uni-v2 LOOKS-WETH.`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(stkLOOKS, LOOKS, "ethereum"), 
    pool2: pool2(LOOKS_ETH_univ2_staking, LOOKS_ETH_univ2, "ethereum"), 
  }
}