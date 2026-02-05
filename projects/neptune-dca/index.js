const { sumTokens2 } = require('../helper/unwrapLPs');

const DCA_CONTRACT = '0x71584790A04838D569f138B639e9B63a4753DAFf';

async function tvl(api) {
  return sumTokens2({
    api,
    owner: DCA_CONTRACT,
    fetchCoValentTokens: true,
  });
}

module.exports = {
  methodology: 'TVL is calculated by summing all tokens deposited in active DCA orders plus CRO gas deposits.',
  cronos: {
    tvl,
  },
};
