const { sumTokensExport } = require("../helper/unwrapLPs");

// USDT na Polygon (via coreAssets.json)
const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";

// Carteira custodiada Livara — onde o USDT dos pools fica retido
const CUSTODIAN_WALLETS = [
  "0x76fAFf4d166ec6d2A016EcB1f21dC289a4CE136F",
];

module.exports = {
  methodology:
    "TVL is the total USDT held in Livara's custodial wallets on Polygon, " +
    "representing funds locked in open prediction pools awaiting settlement.",

  polygon: {
    tvl: sumTokensExport({
      owners: CUSTODIAN_WALLETS,
      tokens: [USDT],
    }),
  },
};
