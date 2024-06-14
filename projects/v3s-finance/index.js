const { stakingPricedLP } = require("../helper/staking");
const { masterchefExports, } = require('../helper/unknownTokens');

const { pool2 } = require('../helper/pool2');
const { mergeExports } = require('../helper/utils');
const vshare = "0xdcC261c03cD2f33eBea404318Cdc1D9f8b78e1AD";
const masterchefV3S = "0xEe38B8d70382c50cDD020785D0aC551d259Cec84";
const boardroom = "0x3F728308A0fb99a8cE4F3F4F87E4e67a38F66746";
const v3sVvspAddress = "0x57b975364140e4a8d1C96FAa00225b855BaB0E8E";
const vShareCroAddress = "0xcb0704BC4E885384ac96F0ED22B9204C3adD91AD"
const vShareRewardsAddr = "0x569608516A81C0B1247310A3E0CD001046dA0663";


const pool2LPs = [
  v3sVvspAddress,
  vShareCroAddress,
];


module.exports = mergeExports([masterchefExports({
  chain: 'cronos',
  nativeToken: vshare,
  masterchef: masterchefV3S,
}), {
  cronos: {
    pool2: pool2(vShareRewardsAddr, pool2LPs),
    staking: stakingPricedLP(boardroom, vshare, "cronos", vShareCroAddress, "wrapped-cro")
  },
}])
