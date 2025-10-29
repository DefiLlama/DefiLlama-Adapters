const { queryContract } = require('../helper/chain/cosmos');
const BigNumber = require('bignumber.js');
const { getConfig } = require('../helper/cache');

const contractAddresses = {
  osmosis: {
    params: 'osmo1nlmdxt9ctql2jr47qd4fpgzg84cjswxyw6q99u4y4u4q6c2f5ksq7ysent',
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
  },
  neutron: {
    params: 'neutron1x4rgd7ry23v2n49y7xdzje0743c5tgrnqrqsvwyya2h6m48tz4jqqex06x',
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
  },
};

const poolsApis = {
  osmosis: 'https://cache.marsprotocol.io/api/osmosis-1/tokens?x-apikey=7e3642de',
  neutron: 'https://cache.marsprotocol.io/api/neutron-1/tokens?x-apikey=7e3642de',
};

async function tvl(api) {
  const chain = api.chain;
  const { params, redBank } = contractAddresses[chain];
  let startAfter = null;
  const pageLimit = 5;

  do {
    const assetParams = await queryContract({
      contract: params,
      chain,
      data: { all_asset_params: { limit: pageLimit, start_after: startAfter } },
    });

    if (assetParams.length === pageLimit) startAfter = assetParams[assetParams.length - 1].denom;
    else startAfter = null;

    await addCoinsFromAssetParams(assetParams);
  } while (startAfter);

  do {
    const markets = await queryContract({
      contract: contractAddresses[chain].redBank,
      chain,
      data: { 'markets': { 'limit': pageLimit, 'start_after': startAfter } },
    });

    if (markets.length === pageLimit) startAfter = markets[markets.length - 1].denom;
    else startAfter = null;

    await deductCoinsFromMarkets(markets);
  } while (startAfter);

  async function addCoinsFromAssetParams(assetParams) {
    const assetDenoms = assetParams.map((asset) => asset.denom);

    // fetch pool infos from the poolsApi based on chain
    const poolInfos = await getConfig(`mars-protocol/${chain}-pools`, poolsApis[chain]);

    // query the deposited amount for each asset and add it to the depositCoins array
    await Promise.all(
      assetDenoms.map(async (denom) => {
        const totalDepositInfo = await queryContract({
          contract: params,
          chain,
          data: { 'total_deposit': { 'denom': denom } },
        });
        // check if the token is a liquidity pool share (deposited via farm)
        // and find it in the api data
        const poolInfo = poolInfos.tokens.find((pool) => pool.lpAddress === denom);

        if (poolInfo) {
          // check for the underlying asset and calculate how much underlying assets a pool share holds
          const totalShares = poolInfo.poolTotalShare;
          const poolAssets = poolInfo.assets;
          poolAssets.forEach((asset) => {
            const amount = new BigNumber(asset.amount);
            const amountPerShare = amount.div(totalShares);

            // add the underlying tokens to the api
            api.add(asset.denom, amountPerShare.times(totalDepositInfo.amount).integerValue(BigNumber.ROUND_DOWN).toString());
          });
        } else {
          // if the it's a token and not a liquidity pool share, add it to the api
          api.add(denom, totalDepositInfo.amount);
        }
      }),
    );
  }

  async function deductCoinsFromMarkets(markets) {
    // query the underlying debt amount from the debt_total_scaled
    await Promise.all(
      markets.map(async (market) => {
        const totalDebt = await queryContract({
          contract: redBank,
          chain,
          data: {
            'underlying_debt_amount': {
              'denom': market.denom,
              'amount_scaled': market['debt_total_scaled'],
            },
          },
        });
        api.add(market.denom, totalDebt * -1);
      }),
    );
  }
}

module.exports = {
  timetravel: false,
  methodology: "For each chain, sum token balances by querying the total deposit amount for each asset in the chain's params contract.",
  osmosis: { tvl },
  neutron: { tvl },
  terra: { tvl: () => 0 },
  hallmarks: [
    [1651881600, 'UST depeg'],
    [1675774800, 'Relaunch on Osmosis'],
    [1690945200, 'Launch on Neutron'],
    [1696906800, 'Mars v2 launch on Osmosis'],
    [1724166000, 'Mars v2 launch on Neutron'],
    [1734098400, 'Perps launch on Neutron']
  ],
};
