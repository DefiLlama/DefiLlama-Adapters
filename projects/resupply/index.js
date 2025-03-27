const sdk = require('@defillama/sdk');
const { getConfig } = require('../helper/cache');

async function tvl(api) {
  const pairs = await getConfig('resupply/tvl/', 'https://raw.githubusercontent.com/resupplyfi/resupply/main/deployment/contracts.json');
  const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)';

  const pairsContracts = Object.entries(pairs)
    .filter(([key]) =>
      !key.endsWith('_DEPRECATED') &&
      (key.startsWith('PAIR_CURVELEND') || key.startsWith('PAIR_FRAXLEND'))
    )
    .map(([, value]) => value);

  const [balances, tokensCollateral, tokens] = await Promise.all([
    api.multiCall({ abi: 'uint256:totalCollateral', calls: pairsContracts }),
    api.multiCall({ abi: 'address:collateral', calls: pairsContracts }),
    api.multiCall({ abi: 'address:underlying', calls: pairsContracts }),
  ]);

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
