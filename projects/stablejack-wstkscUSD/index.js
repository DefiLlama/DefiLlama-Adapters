const { sumTokensExport } = require("../helper/unwrapLPs");
const scUSD = '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE';
const TVL_VAULT = '0x4f22f13828c27b6d8fdeac116155d1df15f31875';

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL includes y-wstkscUSD and p-wstkscUSD, which are both pegged 1:1 to scUSD and mapped to scUSD for pricing.",
  sonic: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [scUSD, TVL_VAULT], // mapped from y-wstkscUSD
        [scUSD, TVL_VAULT], // mapped from p-wstkscUSD
      ],
      blacklistedTokens: [
        '0x8e1e17343b8e4f5e1baa868500163212e00366cc', // y-wstkscUSD
        '0xe8dcbc94a1a852e7f53713a0e927ef16d980b278', // p-wstkscUSD
      ],
      tokenMappings: {
        '0x8e1e17343b8e4f5e1baa868500163212e00366cc': scUSD, // y-wstkscUSD → scUSD
        '0xe8dcbc94a1a852e7f53713a0e927ef16d980b278': scUSD, // p-wstkscUSD → scUSD
      },
    }),
  },
};
