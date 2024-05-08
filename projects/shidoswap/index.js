const { get } = require('../helper/http')
const TVL_ENDPOINT = 'https://swagger.shidoscan.com/cosmos/staking/v1beta1/pool';

async function tvl(_, _1, _2, { api }) {
  const response = await get(TVL_ENDPOINT);
  const tvl = response.pool.bonded_tokens;
  // 18 decimals symbol SHIDO  name shido
  api.add("shido-bonded-tokens",tvl / 1e18)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counted out of the locked tokens value in the consensus mechanism.',
  shido: {
    tvl,
  }
};