const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/sumTokens");

const ZOMMA_CONTRACT_ALPHA = "0x709051774c60c0527dbaf880f41425eae036efaf";
const ZOMMA_CONTRACT_BETA = "0x7bf1f1c2d8caa200b068747487cb9bf109e529f1";
const ZOMMA_CONTRACT_AUDIT = "0xdd5ae451a75a654146747235fdb515f06a55d018";
const USDC_CONTRACT = ADDRESSES.era.USDC;

module.exports = {
  methodology: "TVL is calculated as the sum of USDC deposited by traders and the liquidity in the Pools.",
  era: {
    tvl: sumTokensExport({
      owners: [ZOMMA_CONTRACT_ALPHA, ZOMMA_CONTRACT_BETA, ZOMMA_CONTRACT_AUDIT],
      tokens: [USDC_CONTRACT],
    }),
  },
};