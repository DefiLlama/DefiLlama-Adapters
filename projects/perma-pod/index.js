const { queryContract, sumTokens } = require('../helper/chain/cosmos');
const BigNumber = require('bignumber.js');

// Perma Pod v2 (relaunched 2026-09-28). The v1 red bank (zig1s3frrz…) was emptied by the
// migration and replaced; the pod2 red bank (zig1smfzaz…) never held user funds.
const redBanks = [
  'zig1qghek6p63r56j0dd5asxvc5fmu370l6yfql5spc2khsfzn0ennjqtwz3xz', // v2 red bank
];

// Idle (not lent) deposits inside credit accounts are held by the credit manager, not the red bank.
const creditManagers = [
  'zig1dyp45f79ykkzk6vdafeq36dwfertzt67r5td4ys2j8uy9mpkzjgsrm8yr8', // v2 credit manager
];

async function getMarkets(chain, redBank) {
  let startAfter = null;
  const pageLimit = 5;
  const allMarkets = [];

  do {
    const markets = await queryContract({
      contract: redBank,
      chain,
      data: { markets_v2: { limit: pageLimit, start_after: startAfter } },
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

  markets.forEach((market) => {
    const netAmount = BigNumber(market.collateral_total_amount).minus(market.debt_total_amount);
    api.add(market.denom, netAmount.toFixed(0));
  });

  await sumTokens({ chain: api.chain, owners: creditManagers, api });
}

async function borrowed(api) {
  const markets = await getAllMarkets(api.chain);

  markets.forEach((market) => {
    api.add(market.denom, market.debt_total_amount);
  });
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the tokens held by the protocol: each red bank market\'s supplied amount minus its borrowed amount, plus idle deposits held by the credit manager. Borrowed is the total debt across red bank markets.',
  zigchain: {
    tvl,
    borrowed,
  },
  hallmarks: [
    ['2025-11-16', 'Launch on ZigChain'],
    ['2026-08-29', 'Exploit via mock LP-incentives contract; protocol paused'],
    ['2026-09-28', 'Relaunch on v2 contracts; positions migrated'],
  ],
};
