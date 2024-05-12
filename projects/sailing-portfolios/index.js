const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

// this variable should be read from the portfolio contract
const storedTokens = [
  '0x47a663C082926d0d913cAcB89240c3f4bc409a88', // SAILs
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
  const usdtAddress = '0x919C1c267BC06a7039e03fcc2eF738525769109c'; // usdt
  const dev1Address = '0x797E2CD952DF539Ccfea5554911AFEb2a77Fb760';
  // code below assimilate end code more closely
  const portfolioAddresses = [dev1Address];
  const assetsInPortfolios = portfolioAddresses.map((address) => {
    return [usdtAddress]
  });
  const tokensAndOwners = portfolioAddresses.map((address, i) => {
    return [assetsInPortfolios[i], address];
  });
  console.log(tokensAndOwners);
  return api.sumTokens({ ownerTokens: tokensAndOwners });
}

module.exports = {
  kava: { tvl, },
  methodology: 'The assets in the balancer are detected and counted.'
}
