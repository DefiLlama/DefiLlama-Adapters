const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const farmContract = "0x0cc111738b9627F6f518D746d8Ca9493E9074ABe";
const USDC_NUM_UNIV2 = "0x22527f92f43Dc8bEa6387CE40B87EbAa21f51Df3";
const NUM = "0x3496b523e5c00a4b4150d6721320cddb234c3079";

const farmContract_bsc = "0xc0bE417Db06c4Ec2bDdD7432780AB1d47ae816Fe";
const BUSD_NUM_CakeLP = "0x3b17F6682E8205239B5d4773CE3c1d9632743e88";
const NUM_bsc = "0xeceb87cf00dcbf2d4e2880223743ff087a995ad9";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: (async) => ({}),
    staking: staking(farmContract, NUM),
    pool2: pool2(farmContract, USDC_NUM_UNIV2),   
  },
  bsc: {
    staking: staking(farmContract_bsc, NUM_bsc),
    pool2: pool2(farmContract_bsc, BUSD_NUM_CakeLP),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
