const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

// this variable should be read from the portfolio contract
const storedTokens = [
  '0x47a663C082926d0d913cAcB89240c3f4bc409a88',
];

async function tvl(api) {
  // const addTokenTVL = async (token) => {
  //   const tokenTotalSupply = await api.call({ target: token.address, abi: 'erc20:totalSupply' });
  //   if (token.sufficientLiquidityForDefiLlamaIndexer) {
  //     api.add(token.address, tokenTotalSupply);
  //   } else {
  //     const tickerPricing = await axios.post(
  //       'https://sailingprotocol.org/api/sailingprotocol/market_data/historical_intraday',
  //       {
  //         ticker: token.ticker
  //       }
  //     );
  //     const tickerPrice = Object.values(tickerPricing.data).pop(); // latest price
  //     api.add(
  //       ADDRESSES.kava.USDt, // usdtKavaAddress
  //       tokenTotalSupply * tickerPrice * (1e6 / 1e18)
  //     );
  //   }
  // };
  // const promises = [];
  // for (const token of tokens) {
  //   promises.push(addTokenTVL(token));
  // }
  // await Promise.all(promises);
}

module.exports = {
  kava: { tvl, },
  methodology: 'The assets stored in portfolio tools are detected and counted.'
}
