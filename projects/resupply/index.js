const sdk = require('@defillama/sdk');
const { getConfig } = require('../helper/cache');


const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)';
const coinsAbi = 'function coins(uint256) view returns (address)';
const balancesAbi = 'function balances(uint256) view returns (uint256)'

async function tvl(api) {
    const contracts = await getConfig('resupply/tvl/', 'https://raw.githubusercontent.com/resupplyfi/resupply/main/deployment/contracts.json');

    // Lending Market
    const pairsContracts = Object.entries(contracts)
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

    // Insurance Pool

    const insurancePoolBalance = await api.call({
        target: contracts.INSURANCE_POOL,
        abi: 'uint256:totalAssets',
    });


    const insurancePoolToken = await api.call({
        target: contracts.INSURANCE_POOL,
        abi: 'address:asset',
    });

    api.add(insurancePoolToken, insurancePoolBalance);

    // Liquidity Pools

    const poolContracts = Object.entries(contracts)
    .filter(([key]) => /^(REUSD|WETH).*_POOL$/.test(key))
    .map(([, value]) => value);

    const calls = poolContracts.flatMap(target =>
    [0, 1].map(index => ({ target, params: index }))
    );

    const [allCoins, allBalances] = await Promise.all([
    api.multiCall({ abi: coinsAbi, calls, permitFailure: true }),
    api.multiCall({ abi: balancesAbi, calls, permitFailure: true }),
    ]);

    allCoins.forEach((coin, i) => {
    const balance = allBalances[i];
    if (coin && balance) api.add(coin, balance);
    });

}

module.exports = {
  start: '2025-03-15',
  ethereum: {
    tvl,
  },
};
