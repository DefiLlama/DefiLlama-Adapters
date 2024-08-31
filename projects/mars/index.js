const sdk = require('@defillama/sdk');

const { queryContract} = require('../helper/chain/cosmos');
const { getChainTransform } = require('../helper/portedTokens');

const paramsContractAddresses = {
  'osmosis': 'osmo1nlmdxt9ctql2jr47qd4fpgzg84cjswxyw6q99u4y4u4q6c2f5ksq7ysent',
  'neutron':'neutron1x4rgd7ry23v2n49y7xdzje0743c5tgrnqrqsvwyya2h6m48tz4jqqex06x'
}


// OSMOSIS

async function osmosisTVL() {
  let balances = {};
  await fetchDeposits(balances, 'osmosis');
  return balances;
}

// NEUTRON

async function neutronTVL() {
  let balances = {};
  await fetchDeposits(balances, 'neutron');
  return balances;
}

// HELPERS

async function fetchDeposits(balances, chain) {
  let coins = [];
  let assetParamsPagesRemaining = true;
  let startAfter = null;
  const pageLimit = 5;
  const denomTransform = await getChainTransform(chain);

  while (assetParamsPagesRemaining) {
    const assetParams = await queryContract({
      contract: paramsContractAddresses[chain],
      chain,
      data: { 'all_asset_params': { limit: pageLimit, 'start_after': startAfter } } 
    });

    if(assetParams.length === pageLimit) {
      startAfter = assetParams[assetParams.length - 1].denom;
      assetParamsPagesRemaining = true
    } else {
      assetParamsPagesRemaining = false;
    }

    await addCoinsFromAssetParams(coins, assetParams, chain);
  }

  coins.forEach(coin =>  {
    sdk.util.sumSingleBalance(balances, denomTransform(coin.denom), coin.amount);
  })
}

async function addCoinsFromAssetParams(coins, assetParams, chain) {
  const assetDenoms = assetParams.map(asset => asset.denom);

  // query the deposited amount for each asset and add it to the coins array
  await Promise.all(assetDenoms.map(async denom => {
    let totalDepositInfo = await queryContract({
      contract: paramsContractAddresses[chain],
      chain,
      data: { 'total_deposit': {
        'denom': denom,
      } } 
    });
    coins.push({denom, amount: totalDepositInfo.amount});
  }));
}


module.exports = {
  timetravel: false,
  methodology: 'For each chain, sum token balances by querying the total deposit amount for each asset in the chain\'s params contract.',
  osmosis: {
    tvl: osmosisTVL,
  },
  neutron: {
    tvl: neutronTVL,
  },
  terra: {
    tvl: () => 0,
  },
   hallmarks:[
    [1651881600, 'UST depeg'],
    [1675774800, 'Relaunch on Osmosis'],
    [1690945200, 'Launch on Neutron'],
    [1696906800, 'Mars v2 launch on Osmosis'],
    [1724166000, 'Mars v2 launch on Neutron']
  ]
};
