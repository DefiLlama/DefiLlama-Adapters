const { post, get } = require('../helper/http')
const BigNumber = require('bignumber.js')

async function fetchTvl() {
  const { data: { tvl } } = await get('https://api.venomstake.com/v1/strategies/main');
  return { venom: BigNumber(tvl).div(1e9) };
}

module.exports = {
  timetravel: false,
  venom: {
    tvl: fetchTvl
  }
};
