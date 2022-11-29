const { tombTvl } = require("../helper/tomb");

const thermesTokenAddress = "0x0d7CC067eC64c28bAc1f4f2459d8C2E2603fF78A";
const taresTokenAddress = "0x158521Ab22A4e22f01E6F2d3717cA85341dc694A";
const taresRewardPoolAddress = "0xf29F50Be3cD4F1a3960bf71B41302e2eC6c8eFe4";
const boardroomAddress = "0x254033dA5000E3007d60A10466465EBf122e1851";
const ftmLPs = [
  "0x50E880EA5403283e31cb65da7b549a381b8C69C8", // thermesFtmLpAddress
  "0xac4fa4dBb84932E7377229444f63e06E855Bb2F6", //taresFtmLpAddress
];

module.exports = {
    ...tombTvl(thermesTokenAddress, taresTokenAddress, taresRewardPoolAddress, boardroomAddress, ftmLPs, "fantom", undefined, false, ftmLPs[1])
}