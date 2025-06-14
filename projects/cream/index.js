const ADDRESSES = require("../helper/coreAssets.json");
const { compoundExports } = require("../helper/compound");

module.exports = {
  // hallmarks: [[1635292800, "Flashloan exploit"]],
  timetravel: false, // bsc and fantom api's for staked coins can't be queried at historical points
  start: '2020-09-08', // 09/08/2020 @ 8:00am (UTC)
  ethereum: compoundExports("0xbdC857eae1D15ad171E11af6FC3e99413Ed57Ec4"),
  bsc: compoundExports(
    "0x589DE0F0Ccf905477646599bb3E5C622C84cC0BA",
    "0x1Ffe17B99b439bE0aFC831239dDECda2A790fF3A",
    ADDRESSES.bsc.WBNB
  ),
  polygon: compoundExports("0x20ca53e2395fa571798623f1cfbd11fe2c114c24"),
  arbitrum: compoundExports("0xbadaC56c9aca307079e8B8FC699987AAc89813ee"),
  base: compoundExports("0x94d31f92a7f85b51F0B628467B3E660BA3e8D799"),
};
