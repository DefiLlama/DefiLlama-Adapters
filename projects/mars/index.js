const sdk = require('@defillama/sdk');

const { queryContract} = require('../helper/chain/cosmos');
const { getChainTransform } = require('../helper/portedTokens');

const BigNumber = require("bignumber.js");

const contractAddresses = {
  osmosis: {
    params: 'osmo1nlmdxt9ctql2jr47qd4fpgzg84cjswxyw6q99u4y4u4q6c2f5ksq7ysent',
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
  },
  neutron: {
    params: 'neutron1x4rgd7ry23v2n49y7xdzje0743c5tgrnqrqsvwyya2h6m48tz4jqqex06x',
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
  },
}


// OSMOSIS

async function osmosisTVL() {
  let balances = {};
  await fetchDepositsMinusDebts(balances, 'osmosis');
  return balances;
}

// NEUTRON

async function neutronTVL() {
  let balances = {};
  await fetchDepositsMinusDebts(balances, 'neutron');
  return balances;
}

// HELPERS

async function fetchDepositsMinusDebts(balances, chain) {
  let coins = [];
  let assetParamsPagesRemaining = true;
  let redBankParamsPagesRemaining = true;
  let startAfter = null;
  const pageLimit = 5;
  const denomTransform = await getChainTransform(chain);

  while (assetParamsPagesRemaining) {
    const assetParams = await queryContract({
      contract: contractAddresses[chain].params,
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



  while (redBankParamsPagesRemaining) {
    const markets = await queryContract({
      contract: contractAddresses[chain].redBank,
      chain,
      data: { 'markets': { limit: pageLimit, 'start_after': startAfter } } 
    });

    if(markets.length === pageLimit) {
      startAfter = markets[markets.length - 1].denom;
      redBankParamsPagesRemaining = true
    } else {
      redBankParamsPagesRemaining = false;
    }

    await deductCoinsFromMarkets(coins, markets, chain);
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
      contract: contractAddresses[chain].params,
      chain,
      data: { 'total_deposit': {
        'denom': denom,
      } } 
    });
    coins.push({denom, amount: totalDepositInfo.amount});
  }));
}

async function deductCoinsFromMarkets(coins, markets, chain) {

  // query the underlying debt amount from the debt_total_scaled
  await Promise.all(markets.map(async market => {
    let totalDebt = await queryContract({
      contract: contractAddresses[chain].redBank,
      chain,
      data: { 'underlying_debt_amount': {
        'denom': market.denom,
        'amount_scaled': market.debt_total_scaled
      } } 
    });
    coins.forEach(coin => {
      if(coin.denom === market.denom) {
        coin.amount = new BigNumber(coin.amount).minus(totalDebt).toString();
      }
    });
    
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
