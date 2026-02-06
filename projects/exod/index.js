// const { token } = require('@coral-xyz/anchor/dist/cjs/utils');
const abi = require('./abi.json');
const { getAssetInfo } = require('../helper/chain/algorand');
const sdk = require('@defillama/sdk');

// exod token addresses for different chains
const exodAddresses = {
  arbitrum: {
    token: '0x116998824ff90532906bab91becea4a8e4ce06db',
    priceFeed: '0x5C4c8d6f6Bf79B718F3e8399AaBdFEd01cB7e48f'
  },
  algorand:{
    token: '213345970'
  }
};

async function tvl(api) {
  const { chain } = api;
  const chainAddresses = exodAddresses[chain];

  if (!chainAddresses) {
    console.log(`No exod addresses configured for chain: ${chain}`);
    return api.getBalances();
  }

  // Get the total supply of exod tokens using erc20:totalSupply
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: chainAddresses.token,
  });

  // Add the exod token balance
  api.add(chainAddresses.token, totalSupply);

  return api.getBalances();
}

async function algorandTvl(api) {
  const assetId = exodAddresses.algorand.token;
  
  // Get asset info including circulating supply (total - reserve)
  const info = await getAssetInfo(assetId);
  
  // Get price from Arbitrum price feed (shared price across chains)
  const arbitrumApi = new sdk.ChainApi({ chain: 'arbitrum', timestamp: api.timestamp });
  const price = await arbitrumApi.call({
    abi: abi.latestAnswer,
    target: exodAddresses.arbitrum.priceFeed,
  });
  
  // Price feed returns price with 8 decimals, convert to USD
  const priceUSD = Number(price) / 1e8;
  
  // Calculate TVL: (circulating supply / 10^decimals) * price
  const circulatingSupplyInUnits = Number(info.circulatingSupply) / (10 ** info.decimals);
  const tvlUSD = circulatingSupplyInUnits * priceUSD;
  
  return api.addUSDValue(tvlUSD);
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of EXOD tokens on Arbitrum and circulating supply on Algorand (excluding reserve). Price is fetched from the Arbitrum price feed oracle and applied to all chains.',
  arbitrum: { tvl },
  algorand: { tvl: algorandTvl }
};