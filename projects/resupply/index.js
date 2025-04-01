const { getConfig } = require('../helper/cache');

const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)';

async function tvl(api) {
  const contracts = await getConfig('resupply/tvl', 'https://raw.githubusercontent.com/resupplyfi/resupply/main/deployment/contracts.json');

  // Lending Market
  const pairsContracts = Object.entries(contracts)
    .filter(([key]) =>
      (key.startsWith('PAIR_CURVELEND') || key.startsWith('PAIR_FRAXLEND'))
    )
    .map(([, value]) => value);

  const [balances, tokensCollateral,] = await Promise.all([
    api.multiCall({ abi: 'uint256:totalCollateral', calls: pairsContracts }),
    api.multiCall({ abi: 'address:collateral', calls: pairsContracts }),
  ]);

  const tokens = await api.multiCall({ abi: 'address:asset', calls: tokensCollateral })

  const assetBalances = await api.multiCall({
    abi: convertToAssetsAbi,
    calls: balances.map((balance, i) => ({
      target: tokensCollateral[i],
      params: [balance],
    })),
  });

  api.add(tokens, assetBalances);
}

module.exports = {
  start: '2025-03-15',
  ethereum: {
    tvl,
  },
};
