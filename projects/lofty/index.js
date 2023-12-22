
const { toUSDTBalances } = require('../helper/balances');
const { getEnv } = require('../helper/env');
const { get } = require('../helper/http');

const LoftyTVLApi = "https://partners.lofty.ai/properties/v2/valuations";

async function loftyTVL() {
  const response = (
        await get(LoftyTVLApi, {
          headers: {
            'X-API-Key': getEnv('LOFTY_API')
          }
        })
  ).data;

  const total = response.reduce((acc, item) => {
    acc = acc + item.propertyPrice.currentInvestment;
    return acc;
  }, 0);

  return toUSDTBalances(total);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  algorand: {
    tvl: loftyTVL,
  }
};

// node test.js projects/lofty/index.js
