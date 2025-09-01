const { queryContract } = require('../helper/chain/cosmos');
const BigNumber = require('bignumber.js');

const redBank = 'neutron1k8xyccg9nvfavagqjsqngh66w4z286utqweswl4txtnewaymkc9ss5f5e8'

async function getMarkets(chain, redBank) {
  let startAfter = null;
  const pageLimit = 5;
  const allMarkets = [];

  do {
    const markets = await queryContract({
      contract: redBank,
      chain,
      data: { 'markets_v2': { 'limit': pageLimit, 'start_after': startAfter } },
    });

    allMarkets.push(...markets.data);

    if (markets.length === pageLimit) startAfter = markets[markets.length - 1].denom;
    else startAfter = null;
  } while (startAfter);

  return allMarkets;
}

async function tvl(api) {
  const markets = await getMarkets(api.chain, redBank);
  
  markets.forEach(market => {
    const netAmount = BigNumber(market.collateral_total_amount).minus(market.debt_total_amount);
    api.add(market.denom, netAmount.toString());
  });
}

async function borrowed(api) {
  const markets = await getMarkets(api.chain, redBank);
  
  markets.forEach(market => {
    api.add(market.denom, market.debt_total_amount);
  });
}

module.exports = {
  timetravel: false,
  methodology: "Sum token balances by querying the total deposit amount for each asset from the market stats api.",
  neutron: { 
    tvl,
    borrowed
   },
  hallmarks: [
    [1756303200, 'Launch on Neutron'],
  ],
};
