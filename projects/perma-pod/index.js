const { queryContract, getBalance2 } = require('../helper/chain/cosmos');
const BigNumber = require('bignumber.js');
const { transformBalances } = require('../helper/portedTokens');

// Perma Pod v2 (relaunched 2026-09-28). The v1 red bank (zig1s3frrz…) was emptied by the
// migration and replaced; the pod2 red bank (zig1smfzaz…) never held user funds.
const redBanks = [
  'zig1qghek6p63r56j0dd5asxvc5fmu370l6yfql5spc2khsfzn0ennjqtwz3xz', // v2 red bank
];

// Idle (not lent) deposits inside credit accounts are held by the credit manager, not the red bank.
const creditManagers = [
  'zig1dyp45f79ykkzk6vdafeq36dwfertzt67r5td4ys2j8uy9mpkzjgsrm8yr8', // v2 credit manager
];

// stZIG has no price feed, so it is counted as ZIG at Valdora's redemption rate
// (https://docs.valdora.finance/smart-contracts). Since ZIGChain v5 Valdora quotes azig.
const STZIG_DENOM = 'coin.zig109f7g2rzl2aqee7z6gffn8kfe9cpqx0mjkk7ethmx8m2hq4xpe9snmaam2.stzig';
const ZIG_DENOM = 'azig';
const VALDORA_STAKER_CONTRACT = 'zig18nnde5tpn76xj3wm53n0tmuf3q06nruj3p6kdemcllzxqwzkpqzqk7ue55';
const PROBE_AZIG = 10n ** 21n; // 1,000 ZIG

// Returns how much stZIG redeeming PROBE_AZIG gives. Throws rather than letting stZIG go
// unpriced (and silently missing from the totals) when the rate is unavailable.
async function stzigPerProbe(chain) {
  const { stzig_amount } = await queryContract({
    contract: VALDORA_STAKER_CONTRACT,
    chain,
    data: { reverse_st_zig_price: { amount: PROBE_AZIG.toString() } },
  });
  if (!stzig_amount || stzig_amount === '0') throw new Error('Valdora returned no stZIG rate');
  return BigInt(stzig_amount);
}

function adder(api, stzigProbe) {
  return (denom, amount) => {
    if (denom === STZIG_DENOM) {
      api.add(ZIG_DENOM, ((BigInt(amount) * PROBE_AZIG) / stzigProbe).toString());
    } else {
      api.add(denom, amount);
    }
  };
}

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
  const [markets, stzigProbe] = await Promise.all([getAllMarkets(api.chain), stzigPerProbe(api.chain)]);
  const add = adder(api, stzigProbe);

  markets.forEach((market) => {
    const netAmount = BigNumber(market.collateral_total_amount).minus(market.debt_total_amount);
    add(market.denom, netAmount.toFixed(0));
  });

  for (const owner of creditManagers) {
    await getBalance2({ chain: api.chain, owner, api: { add } });
  }

  // maps azig to its price source (helper/tokenMapping.js)
  return transformBalances(api.chain, api.getBalances());
}

async function borrowed(api) {
  const [markets, stzigProbe] = await Promise.all([getAllMarkets(api.chain), stzigPerProbe(api.chain)]);
  const add = adder(api, stzigProbe);

  markets.forEach((market) => {
    add(market.denom, market.debt_total_amount);
  });

  return transformBalances(api.chain, api.getBalances());
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the tokens held by the protocol: each red bank market\'s supplied amount minus its borrowed amount, plus idle deposits held by the credit manager. Borrowed is the total debt across red bank markets. stZIG is counted as ZIG at Valdora\'s redemption rate.',
  zigchain: {
    tvl,
    borrowed,
  },
  hallmarks: [
    ['2025-11-16', 'Launch on ZigChain'],
    ['2026-08-29', 'Exploit via mock LP-incentives contract; protocol paused'],
    ['2026-09-28', 'Relaunch on v2 contracts; positions migrated'],
    ['2026-10-01', 'v2 markets reopened'],
  ],
};
