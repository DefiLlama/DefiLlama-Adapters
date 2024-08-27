
const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl() {
  let result = await get('https://metrics.icpex.org/llama/tvl');
  if (result.retCode === 1 && result.retMsg === "success") {
    const tvl = result.data;
    return toUSDTBalances(tvl);
  } else {
    throw new Error(`API error! message: ${result.retMsg}`);
  }
}
