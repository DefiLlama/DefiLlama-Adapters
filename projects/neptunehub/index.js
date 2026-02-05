const { sumTokens2 } = require('../helper/unwrapLPs');

// NeptuneHub Contracts on Cronos
const CONTRACTS = {
  DCA: '0x71584790A04838D569f138B639e9B63a4753DAFf',
  SWAP_AGGREGATOR: '0xb3f2B217B024700b6B85bB0941d4958EF17214C1',
};

async function tvl(api) {
  return sumTokens2({
    api,
    owners: Object.values(CONTRACTS),
    fetchCoValentTokens: true,
  });
}

module.exports = {
  methodology: 'TVL is calculated by summing all tokens held in NeptuneHub contracts including DCA deposits and swap aggregator balances.',
  cronos: {
    tvl,
  },
};
