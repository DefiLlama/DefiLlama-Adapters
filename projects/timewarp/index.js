const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

const TimeWarpPool_LP_UNISWAP_ETH =  "0x55c825983783c984890bA89F7d7C9575814D83F2";
const TimeWarpPool_LP_PANCAKE_BSC =  "0xC48467BA55cF0B777978F19701329c87949EFD3C";

const TimeWarpPool_TIME_ETH = "0xa106dd3Bc6C42B3f28616FfAB615c7d494Eb629D";
const TimeWarpPool_TIME_BSC = "0x59f2757Ae3a1BAa21e4f397a28985Ceb431c676b";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    pool2: pool2(TimeWarpPool_LP_UNISWAP_ETH, '0x1d474d4B4A62b0Ad0C819841eB2C74d1c5050524'),
    staking: staking(TimeWarpPool_TIME_ETH, '0x485d17A6f1B8780392d53D64751824253011A260'),
  },
  bsc: {
    tvl: () => ({}),
    pool2: pool2(TimeWarpPool_LP_PANCAKE_BSC, '0xa5ebD19961CF4B8aF06a9d9D2B91d73B48744867'),
    staking: staking(TimeWarpPool_TIME_BSC, '0x3b198e26E473b8faB2085b37978e36c9DE5D7f68'),
  },
  methodology: `We count as TVL the staking Lps on Ethereum (TIME-ETH Sushiswap LP)
   and Binance (TIME-BNB Pancake LP) networks threw their TimeWarpPool contracts; and
   we count the staking native token (TIME) on both netwarks, separated from tvl`,
};
