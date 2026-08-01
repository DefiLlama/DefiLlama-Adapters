const { queryContract } = require('../helper/chain/cosmos');
const BigNumber = require('bignumber.js');

const redBanks = [
  'zig1s3frrzltqaxvuzffvxg89uuad6nkcyqe3ucvrahynznaek3mhe4s75puyu', // Main market
  'zig1smfzazs6eg86vz23p8t7dk3gr4nnwr5m40yae9cl2m7erx3rnm2sxecuyc', // BTC market
];

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

    const marketsData = markets.data || markets;
    allMarkets.push(...marketsData);

    if (marketsData.length === pageLimit) startAfter = marketsData[marketsData.length - 1].denom;
    else startAfter = null;
  } while (startAfter);

  return allMarkets;
}

async function getAllMarkets(chain) {
  const results = await Promise.all(redBanks.map((rb) => getMarkets(chain, rb)));
  return results.flat();
}

async function tvl(api) {
  const markets = await getAllMarkets(api.chain);

  markets.forEach(market => {
    const netAmount = BigNumber(market.collateral_total_amount).minus(market.debt_total_amount);
    api.add(market.denom, netAmount.toString());
  });
}

async function borrowed(api) {
  const markets = await getAllMarkets(api.chain);

  markets.forEach(market => {
    api.add(market.denom, market.debt_total_amount);
  });
}

module.exports = {
  timetravel: false,
  methodology: "Sum token balances by querying the total deposit amount for each asset across the Main and Solv red banks.",
  zigchain: {
    tvl,
    borrowed
  },
  hallmarks: [
    ['2025-11-16', 'Launch on ZigChain'],
  ],
};
