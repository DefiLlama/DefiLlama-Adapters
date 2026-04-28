const { sumTokensExport } = require('../helper/sumTokens');

// Адрес вашего контракта маркетплейса, где могут временно лежать деньги
const MARKETPLACE_CONTRACT = "0x8c70A206A5595f7d82B70F552D53BD65463D5891";

// Список токенов, которые используются для покупок (Polygon)
const TOKENS = [
  "0x0000000000000000000000000000000000000000", // Нативный MATIC (POL)
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC.e
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
];

module.exports = {
  methodology: "TVL counts the MATIC and tokens held in the marketplace smart contract for active bids or escrow.",
  polygon: {
    tvl: sumTokensExport({ owner: MARKETPLACE_CONTRACT, tokens: TOKENS }),
  }
};
