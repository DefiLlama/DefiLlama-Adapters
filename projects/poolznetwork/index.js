const { sumTokensExport } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const coreAssets = require("../helper/coreAssets.json");

const stakingVaults = [
  "0x5eb57B1210338b13E3D5572d5e1670285Aa71702",
  "0x436CE2ce8d8d2Ccc062f6e92faF410DB4d397905",
  "0xbAeA9aBA1454DF334943951d51116aE342eAB255",
];

const POOLX = "0xbAeA9aBA1454DF334943951d51116aE342eAB255";

const pools = [
  "0xCc8f6A82Ff034C15dFDAcBcab29F7Ea28C616EF7", // The Poolz
  "0x41b56bF3b21C53F6394a44A2ff84f1d2bBC27841", // SignUP Pool
  "0x7Ff9315f538dF7eC76Ec4815249Dd30519726460", // The Poolz
];

const tokens = [coreAssets.null, coreAssets.bsc.USDT, coreAssets.bsc.BUSD];

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: pools, tokens: tokens }),
    staking: staking(stakingVaults, POOLX),
  },
};
