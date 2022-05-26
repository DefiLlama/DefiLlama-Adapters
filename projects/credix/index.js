const retry = require('../helper/retry');
const axios = require('axios');

async function fetch() {
  const metrics = (
      await retry(
          async (bail) => await axios.get('https://api.credix.finance/stats/markets/credix-marketplace')
      )
  ).data;

  const liquidityPoolAmount = parseInt(metrics.liquidity_pool_amount.uiAmount); 
  const totalCreditOutstanding = parseInt(metrics.total_outstanding_credit.uiAmount);
  const tvl = liquidityPoolAmount + totalCreditOutstanding; 

  return tvl
}

module.exports = {
    fetch
};