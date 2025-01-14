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

const tokensBase = [
  ADDRESSES.base.WETH,
  ADDRESSES.base.USDC,
  ADDRESSES.ethereum.USDM,
];

const owner = "0x39e2f550fef9ee15b459d16bD4B243b04b1f60e5";
const ownerBase = "0x546Fb1621CF8C0e8e3ED8E3508b7c5100ADdBc03";

module.exports = {
  methodology: "Sum assets on Nayms",
  start: '2023-04-20', // Thu Apr 20 13:36:59 2023 GMT
  hallmarks: [[1681990619, "Nayms V3 Launch"]],
  ethereum: {
    tvl: sumTokensExport({ owner, tokens }),
  },
  base: {
    tvl: sumTokensExport({ owner: ownerBase, tokens: tokensBase }),
  },
};
