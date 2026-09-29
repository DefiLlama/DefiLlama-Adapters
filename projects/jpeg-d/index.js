const { staking } = require("../helper/staking");
const { tvl, stakingJPEGD } = require("./helper/index");
const { LP_STAKING, JPEG_WETH_SLP } = require("./helper/addresses");

module.exports = {
  methodology: `Counts the floor value of all NFTs supplied in the protocol vaults`,
  ethereum: {
    tvl,
    staking: stakingJPEGD,
    pool2: staking(LP_STAKING, [JPEG_WETH_SLP]),
  },
  hallmarks: [
    ['2022-10-17', "pETH borrows"],
    ['2022-11-27', "JPEG LTV boost"],
    ['2023-07-30', "pETH-ETH Curve pool drained"],
    ['2023-09-14', "pETH Citadel relaunch"],
  ],
};
