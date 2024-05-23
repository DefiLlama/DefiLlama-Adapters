const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

// this variable should be read from the portfolio contract
const storedTokens = [
  '0x47a663C082926d0d913cAcB89240c3f4bc409a88', // SAILs
];

async function tvl(api) {
  // await api.call({ target: token.address, abi: 'function getTrackedPortfolios() external view returns (address[] memory)' });
  // await api.call({ target: token.address, abi: 'function getPortfolioAssets() view public returns (address[] memory)' });

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
  const usdcSailingAddress = '0x6dAE38e39F80c1F6D1D40224f79150AECc73f987'; // usdcsailing
  const sailsSailingAddress = '0x47a663c082926d0d913cacb89240c3f4bc409a88'; // sailssailing
  
  const dev1Address = '0x797E2CD952DF539Ccfea5554911AFEb2a77Fb760';
  const mainAddress = '0xf068B5EbABf25f5FF69d21c8536b5a5a19C53A10';
  // code below assimilate end code more closely
  const portfolioAddresses = [dev1Address, mainAddress];
  const assetsInPortfolios = portfolioAddresses.map((address) => {
    return [usdtAddress, sailsSailingAddress]
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
