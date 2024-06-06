const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const tokens = [
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.DAI,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.TUSD,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.USDM,
];

const owner = "0x39e2f550fef9ee15b459d16bD4B243b04b1f60e5";

module.exports = {
  methodology: "Sum assets on Nayms",
  start: 1681990619, // Thu Apr 20 13:36:59 2023 GMT
  ethereum: {
    tvl: sumTokensExport({ owner, tokens }),
  },
  hallmarks: [[1681990619, "Nayms V3 Launch"]],
};
