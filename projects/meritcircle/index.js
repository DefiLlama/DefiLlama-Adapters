const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");

const mc = "0x949d48eca67b17269629c7194f4b727d4ef9e5d6";
const mcPool = "0x5c76aD4764A4607cD57644faA937A8cA16729e39";
const mcPoolV2 = "0x74aDae862AdCCCF7a7DBF2f7B139AB56e6b0E79D";
const mcLPPool = "0x44c01e5e4216f3162538914d9c7f5E6A0d87820e";
const mcLPPoolV2 = "0xebE3CA21e37723E0bE0F519724798fe8EEfF83D1";
const mcWETHUNILP = "0xcCb63225a7B19dcF66717e4d40C9A72B39331d61";

module.exports = {
  ethereum: {
    tvl: async () => ({}),
    pool2: pool2s([mcLPPool, mcLPPoolV2], [mcWETHUNILP]),
    staking: stakings([mcPool, mcPoolV2], mc),
  },
};
