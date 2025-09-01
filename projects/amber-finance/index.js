const { queryContract } = require('../helper/chain/cosmos');
const axios = require('axios');
const BigNumber = require('bignumber.js');

const contractAddresses = {
  params: 'neutron1y2hjwse8sq77gvsmcy8gm6kjye6a3g9ksyxdjg99ceg3rmlpq5usyv5n07',
  redBank: 'neutron1k8xyccg9nvfavagqjsqngh66w4z286utqweswl4txtnewaymkc9ss5f5e8',
}


async function tvl(api) {
  const chain = api.chain;
  const { params, redBank } = contractAddresses
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
      contract: redBank,
      chain,
      data: { 'markets': { 'limit': pageLimit, 'start_after': startAfter } },
    });

    if (markets.length === pageLimit) startAfter = markets[markets.length - 1].denom;
    else startAfter = null;

    await deductCoinsFromMarkets(markets);
  } while (startAfter);
  async function addCoinsFromAssetParams(assetParams) {
    const assetDenoms = assetParams.map((asset) => asset.denom);

    // query the deposited amount for each asset and add it to the depositCoins array
    await Promise.all(
      assetDenoms.map(async (denom) => {
        const totalDepositInfo = await queryContract({
          contract: params,
          chain,
          data: { 'total_deposit': { 'denom': denom } },
        });
          api.add(denom, totalDepositInfo.amount);
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
  methodology: "Sum token balances by querying the total deposit amount for each asset from the market stats api.",
  neutron: { tvl },
  hallmarks: [
    [1756303200, 'Launch on Neutron'],
  ],
};
