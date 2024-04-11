const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const LOOKS = "0xf4d2888d29D722226FafA5d9B24F9164c092421E";
const tokenDistributor = "0x465a790b428268196865a3ae2648481ad7e0d3b1";
const stakingContract = "0xbcd7254a1d759efa08ec7c3291b2e85c5dcc12ce";
const LOOKS_ETH_univ2 = '0xdc00ba87cc2d99468f7f34bc04cbf72e111a32f7'
const LOOKS_ETH_univ2_staking = '0x2a70e7f51f6cd40c3e9956aa964137668cbfadc5'

// LOOKS staking send the looks token to the tokenDistributor contract
// https://etherscan.io/tx/0xcf9e2d958b2ca04f735e6643c8b3be098ce3befda72957abe94676e2db017dbb

module.exports = {
  methodology: `TVL for LOOKS.RARE consists of the staking of LOOKS and pool2 of uni-v2 LOOKS-WETH.`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(tokenDistributor, LOOKS), 
    pool2: pool2(LOOKS_ETH_univ2_staking, LOOKS_ETH_univ2), 
  }
}