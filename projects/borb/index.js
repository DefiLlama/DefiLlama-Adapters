const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDT_CONTRACT = ADDRESSES.bsc.USDT;
const USDTR_CONTRACT = "0x594Cc4566e38A6105a851F1389b47CC37c5a2a3D";

const USDC_CONTRACT = ADDRESSES.bsc.USDC;
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
