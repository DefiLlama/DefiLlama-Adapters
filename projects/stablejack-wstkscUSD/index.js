const { sumTokensExport } = require("../helper/unwrapLPs");

const scUSD = '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE';           // scUSD token (priced)
const wstkscUSD = '0x9fb76f7ce5fceaa2c42887ff441d46095e494206';       // wstkscUSD token (unpriced)
const HOLDER_CONTRACT = '0xb27f555175e67783ba16f11de3168f87693e3c8f'; // Contract holding wstkscUSD

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL tracks wstkscUSD token balance mapped to scUSD price since wstkscUSD is not indexed yet.",
  sonic: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [scUSD, HOLDER_CONTRACT], // Using scUSD as price for wstkscUSD balance
      ],
      blacklistedTokens: [
        wstkscUSD, // Blacklist wstkscUSD to avoid double counting
      ],
      tokenMappings: {
        [wstkscUSD]: scUSD, // Map wstkscUSD token to scUSD price
      },
    }),
  },
};
