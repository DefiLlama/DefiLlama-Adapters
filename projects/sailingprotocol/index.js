const sdk = require('@defillama/sdk');
const axios = require('axios');

const tokens = [
  {
    "address": "0x75B5DACEc8DACcb260eA47549aE882513A21CE01",
    "ticker": "SPY",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x2E4763AdBEe00D5eB3089ec25973599c0e62dD07",
    "ticker": "ARKK",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  }
];

async function tvl(_0, blockNumber, _2, { api }) {
  for (const token of tokens) {
    const tokenTotalSupply = await api.call({ target: token.address, abi: 'erc20:totalSupply' });
    // api.add(token.address, tokenTotalSupply);
    if (!token.sufficientLiquidityForDefiLlamaIndexer) {
      const tickerPricing = await axios.post(
        'https://sailingprotocol.org/api/sailingprotocol/market_data/historical_intraday',
        {
          ticker: token.ticker
        }
      );
      const tickerPrice = tickerPricing.data.at(-1)[1];
      api.add(
        '0x919C1c267BC06a7039e03fcc2eF738525769109c', // usdtKavaAddress
        tokenTotalSupply * tickerPrice * (1e6 / 1e18)
      );
    }
  }
}

module.exports = {
  misrepresentedTokens: true, // false, // until all tokens are indexed by defillama
  timetravel: false, // true, // until there is enough dex liquidity for the main tokens
  kava: { tvl, },
  methodology: 'The total supply of their circulating stocks is extracted from their stock token contracts.'
}
