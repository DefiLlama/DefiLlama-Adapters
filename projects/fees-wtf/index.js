const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const WTF = "0xA68Dd8cB83097765263AdAD881Af6eeD479c4a33";
const stakingContract = "0x0bf0e1678eaa36cd2d705cab3ce8020de443056c";
const WTF_ETH_univ2 = '0xab293dce330b92aa52bc2a7cd3816edaa75f890b'
const WTF_ETH_univ2_staking = '0xf0c51dc9a85d00c1c1bebfbb2d1465a39f4702d8'

module.exports = {
  methodology: `TVL for fees.wtf consists of the staking of WTF and pool2 of uni-v2 WTF-WETH.`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(stakingContract, WTF), 
    pool2: pool2(WTF_ETH_univ2_staking, WTF_ETH_univ2), 
  }
}