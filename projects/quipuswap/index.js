const BigNumber = require('bignumber.js')
const { request, gql } = require("graphql-request");

const graphUrl = 'https://granada-api.quipuswap.com';
const tvlQuery = gql`
query {
  overview {
    xtzUsdQuote
    totalLiquidity
  }
}`;

async function fetch() {
    const data = await request(graphUrl, tvlQuery);
    const xtzUsdQuote = new BigNumber(data.overview.xtzUsdQuote);
    const totalLiquidity = new BigNumber(data.overview.totalLiquidity);
    return totalLiquidity.multipliedBy(xtzUsdQuote).dividedBy(1000000).toFixed(0);
}

module.exports = {
  methodology: 'TVL counts the liquidity of QuipuSwap DEX. Data is pulled from:"https://granada-api.quipuswap.com".',
    misrepresentedTokens: true,
    fetch
}