const { queryContract } = require('../helper/chain/cosmos');
const { transformBalances } = require('../helper/portedTokens');

const VALDORA_STAKER_CONTRACT = 'zig18nnde5tpn76xj3wm53n0tmuf3q06nruj3p6kdemcllzxqwzkpqzqk7ue55';

async function fetchStakerAUM() {
  const { funds_raised } = await queryContract({
    contract: VALDORA_STAKER_CONTRACT,
    chain: 'zigchain',
    data: { funds_raised: {} },
  });
  if (!funds_raised || funds_raised === '0') return null;
  return funds_raised;
}

async function tvl(api) {
  const balances = api.getBalances();

  const stakerAum = await fetchStakerAUM();
  if (stakerAum) balances['zigchain:azig'] = stakerAum;

  return transformBalances('zigchain', balances);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Total ZIG deposited into Valdora liquid staking. The stZIG receipt token is excluded to avoid double-counting. Valdora Vaults (short-duration private credit) are real-world assets tracked on the RWA dashboard, not in TVL.",
  zigchain: { tvl },
};
