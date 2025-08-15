const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const contracts = [
  "0x4d377340a2875b875e1C104B9905F74FD716F59e", //CoreVault
  "0xbEd96a81f8694947159eD0556B077b35Fa8379a7", //FeeVault
  "0x7B173a3A8d562B7Fb99743a3707deF1236935ac5", //ETH market
  "0x1e9cbaaa0a7c1F72a8769EA0e3A03e7fB5458925", //BTC market
  "0x54c14Fa76eeD09897F09d06580b3add70793CF19", //RewardDistributor
];

const tokens = [ADDRESSES.arbitrum.USDT];

module.exports = {
  start: '2023-08-05',
  arbitrum: { tvl: sumTokensExport({ tokens, owners: contracts }) },
  hallmarks: [[1691240820, "Blex Protocol Deployed on Arbitrum"]],
};
