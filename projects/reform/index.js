const sdk = require('@defillama/sdk')

const TOKEN_CONTRACT = '0xea3eed8616877F5d3c4aEbf5A799F2e8D6DE9A5E';

async function getGrowityMetrics() {
  // Fetch the market cap for Growity or define the API source here
  return await sdk.api.util.fetchJSON('https://mkl2z286c7.execute-api.eu-west-1.amazonaws.com/prod/overview');
}

async function getPriceRFRM() {
  // Fetch the price of RFRM from a reliable source like CoinMarketCap
  return await sdk.api.util.fetchJSON('https://api.coinmarketcap.com/v1/ticker/growity-rfrm/');
}

// async function getHolderCount() {
//   // Fetch the holder count from Etherscan or another blockchain explorer
//   return await sdk.api.util.fetchJSON('https://api.etherscan.io/api?module=stats&action=tokenholdercount&contractaddress=' + TOKEN_CONTRACT);
// }


// Function to calculate and export Growity-specific metrics
async function growityMetrics() {
    const growityMetrics = await getGrowityMetrics();

  const tvl = growityMetrics.locked;
  const marketCap = growityMetrics.market_cap;
  const staking = growityMetrics.staking;
  const priceRFRM = await getPriceRFRM();
//   const holders = await getHolderCount();

  const stakingTVL = staking * marketCap;


  return {
    tvl,
    marketCap,
    stakingTVL,
    priceRFRM,
    // holders,
  };
}


module.exports = {
  bsc: {
    growityMetrics,
  },
};
