const { getConfig } = require('../helper/cache');
const { staking } = require("../helper/staking.js");

const RESUP_TOKEN = '0x419905009e4656fdc02418c7df35b1e61ed5f726';
const GOV_STAKING_CONTRACT = '0x22222222E9fE38F6f1FC8C61b25228adB4D8B953';

const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)';

async function tvl(api) {
  const pairsContracts = await api.call({  abi: 'address[]:getAllPairAddresses', target: '0x10101010E0C3171D894B71B3400668aF311e7D94'})

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

async function stakingTvl(api) {
  const resupBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: RESUP_TOKEN,
    params: [GOV_STAKING_CONTRACT],
  });

  api.add(RESUP_TOKEN, resupBalance);
}

module.exports = {
  start: '2025-03-15',
  ethereum: {
    tvl,
    staking: stakingTvl,
  },
};
