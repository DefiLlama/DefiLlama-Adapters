const { sumTokensExport } = require("../helper/sumTokens");

const BITFLOW_ADDRESS = "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M";

const PAIRS = [
  `${BITFLOW_ADDRESS}.stableswap-stx-ststx-v-1-1`,
  `${BITFLOW_ADDRESS}.stableswap-stx-ststx-v-1-2`,
  `${BITFLOW_ADDRESS}.stableswap-usda-susdt-v-1-2`,
  `${BITFLOW_ADDRESS}.stableswap-abtc-xbtc-v-1-2`,
  `${BITFLOW_ADDRESS}.stableswap-aeusdc-susdt-v-1-2`,
  `${BITFLOW_ADDRESS}.stableswap-usda-aeusdc-v-1-2`,
];

module.exports = {
  stacks: {
    tvl: sumTokensExport({ owners: PAIRS }),
  },
  methodology: "Total Liquidity Added to DEX Trading Pools",
};
