const sdk = require('@defillama/sdk');
const utils = require('../utils');

const dsfPoolStables = '0x22586ea4fdaa9ef012581109b336f0124530ae69';

const abi = {
  totalHoldings: "uint256:totalHoldings"
};

const collectPools = async () => {
  
  const tvl = await getTVL(dsfPoolStables);
  const apyData = await getAPYFromAPI();

  const currentDate = new Date();
  const cutoffDate = new Date('2024-12-01');
  const multiplier = currentDate < cutoffDate ? 0.85 : 0.8;
  const adjustedApy = apyData.apy * multiplier;
  
  return [
    {
      pool: `${dsfPoolStables}-ethereum`,
      chain: utils.formatChain('ethereum'),
      project: 'dsf.finance',
      symbol: 'USDT-USDC-DAI',
      tvlUsd: tvl / 1e18,
      apy: adjustedApy,
      rewardTokens: null,
      underlyingTokens: [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        '0x6B175474e89094C44Da98b954EedeAC495271d0F'  // DAI
      ],
      url: 'https://app.dsf.finance/',
    }
  ];
};

async function getTVL(contractAddress) {
  const tvlResponse = await sdk.api.abi.call({
    target: contractAddress,
    abi: abi.totalHoldings,
    chain: 'ethereum',
  });
  const totalHoldings = tvlResponse.output;
  return totalHoldings;
}

async function getAPYFromAPI() {
  try {
    const response = await utils.getData('https://yields.llama.fi/chart/8a20c472-142c-4442-b724-40f2183c073e');
    if (response && response.status === 'success' && response.data && response.data.length > 0) {
      const latestData = response.data[response.data.length - 1];
      return { apy: latestData.apy };
    } else {
      throw new Error('API response is empty or undefined');
    }
  } catch (error) {
    console.error('Error fetching APY data:', error);
    return { apy: 0 };
  }
}

module.exports = {
  timetravel: false,
  apy: collectPools,
  url: 'https://dsf.finance/',
};
