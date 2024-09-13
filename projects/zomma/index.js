const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/sumTokens");

const ZOMMA_CONTRACT_ALPHA = "0x709051774c60c0527dbaf880f41425eae036efaf";
const ZOMMA_CONTRACT_BETA = "0x7bf1f1c2d8caa200b068747487cb9bf109e529f1";
const ZOMMA_CONTRACT_ETH_AUDIT = "0xdd5ae451a75a654146747235fdb515f06a55d018";
const ZOMMA_CONTRACT_BTC_AUDIT = "0x1f14544aea89046e068e98c8672d2fbc3ab45bab";
const ZK_USDC_CONTRACT = ADDRESSES.era.USDC;

const ZOMMA_ARB_VAULT = "0x452610BB258c143B5f26687286AE5e59EC69c267";
const ZOMMA_ARB_CONTRACT_ETH = "0xa9DEb981b735EC0525c8D4C959267429FdD82347";
const ARB_USDC_CONTRACT = ADDRESSES.arbitrum.USDC_CIRCLE;
const ARB_AAVE_USDC_CONTRACT = "0x724dc807b04555b71ed48a6896b6F41593b8C637";

module.exports = {
  methodology:
    "TVL is calculated as the sum of USDC deposited by traders and the liquidity in the Pools.",
  arbitrum: {
    tvl: sumTokensExport({
      owners: [ZOMMA_ARB_VAULT, ZOMMA_ARB_CONTRACT_ETH],
      tokens: [ARB_USDC_CONTRACT, ARB_AAVE_USDC_CONTRACT],
    }),
  },
  era: {
    tvl: sumTokensExport({
      owners: [
        ZOMMA_CONTRACT_ALPHA,
        ZOMMA_CONTRACT_BETA,
        ZOMMA_CONTRACT_ETH_AUDIT,
        ZOMMA_CONTRACT_BTC_AUDIT,
      ],
      tokens: [ZK_USDC_CONTRACT],
    }),
  },
};