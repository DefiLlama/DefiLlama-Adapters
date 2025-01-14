const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(_, _b, _cb, { api, }) {
    const owners = [
      '0x1A84d7E27e7f0e93Da74b93095e342b6e8dBd50A', // Dexodus liquidity pool address
      '0x39016479A05626Df9BA4cB80864E1B3b69D694b4', // Dexodus core futures address
      '0x1692992ee7EE987510Dd32BFCeF2C08C8080d5b2'  // Dexodus referrals address
    ];
    const tokens = [
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
      '0x4200000000000000000000000000000000000006', // WETH on Base
    ];
    return sumTokens2({ api, owners, tokens });
  }
  
  module.exports = {
    methodology: 'Counts the USDC and WETH tokens in the Dexodus liquidity pool, core futures and referrals on Base.',
    base: {
      tvl,
    },
  };
  