
const { queryContract } = require('../helper/chain/cosmos');

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

async function tvl(api) {
  const chain = api.chain
  const { params, redBank } = contractAddresses[chain];
  let startAfter = null;
  const pageLimit = 5;

  do {
    const assetParams = await queryContract({
      contract: params,
      chain,
      data: { 'all_asset_params': { limit: pageLimit, 'start_after': startAfter } }
    });

    if (assetParams.length === pageLimit)
      startAfter = assetParams[assetParams.length - 1].denom;
    else
      startAfter = null;


    await addCoinsFromAssetParams(assetParams);
  } while (startAfter)


  do {
    const markets = await queryContract({
      contract: contractAddresses[chain].redBank,
      chain,
      data: { 'markets': { limit: pageLimit, 'start_after': startAfter } }
    });

    if (markets.length === pageLimit)
      startAfter = markets[markets.length - 1].denom;
    else
      startAfter = null;


    await deductCoinsFromMarkets(markets);
  } while (startAfter)

  async function addCoinsFromAssetParams(assetParams) {
    const assetDenoms = assetParams.map(asset => asset.denom);

    // query the deposited amount for each asset and add it to the depositCoins array
    await Promise.all(assetDenoms.map(async denom => {
      let totalDepositInfo = await queryContract({
        contract: params, chain,
        data: { 'total_deposit': { 'denom': denom, } }
      });
      api.add(denom, totalDepositInfo.amount);
    }));
  }

  async function deductCoinsFromMarkets(markets) {

    // query the underlying debt amount from the debt_total_scaled
    await Promise.all(markets.map(async market => {
      let totalDebt = await queryContract({
        contract: redBank, chain,
        data: {
          'underlying_debt_amount': {
            'denom': market.denom,
            'amount_scaled': market['debt_total_scaled']
          }
        }
      });
      api.add(market.denom, totalDebt * -1)
    }));
  }
}


module.exports = {
  timetravel: false,
  methodology: 'For each chain, sum token balances by querying the total deposit amount for each asset in the chain\'s params contract.',
  osmosis: { tvl, },
  neutron: { tvl, },
  terra: {
    tvl: () => 0,
  },
  hallmarks: [
    [1651881600, 'UST depeg'],
    [1675774800, 'Relaunch on Osmosis'],
    [1690945200, 'Launch on Neutron'],
    [1696906800, 'Mars v2 launch on Osmosis'],
    [1724166000, 'Mars v2 launch on Neutron']
  ]
};
