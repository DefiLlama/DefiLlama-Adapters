const { sumTokensExport } = require("../helper/unwrapLPs");

const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
const USDTR_CONTRACT = "0x594Cc4566e38A6105a851F1389b47CC37c5a2a3D";

const USDC_CONTRACT = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDCR_CONTRACT = "0x4b970ED4E52088F8b8E62e2bF1772b545B97fd8f";

module.exports = {
  methodology: "counts the number of USDT and USDC tokens in the BorB contracts.",
  bsc: {
    tvl: sumTokensExport({ tokensAndOwners: [
      [USDT_CONTRACT, USDTR_CONTRACT],
      [USDC_CONTRACT, USDCR_CONTRACT],
    ]}),
  },
};
