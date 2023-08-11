const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const owners = ["0x1c3f35F7883fc4Ea8C4BCA1507144DC6087ad0fb", "0xfE03be1b0504031e92eDA810374222c944351356"];

module.exports = {
  start: 1690971144,
  bsc: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.bsc.USDT], }) },
};