const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

async function fetch() {
  const response = await get('https://api.yieldhub.finance/tvl');
  let tvl = Object.values(response).map(i => Object.values(i)).flat().reduce((acc, i) => acc + i, 0)
  return toUSDTBalances(tvl);
}

module.exports = {
  timetravel: false,
  telos: {
    tvl: fetch
  },
}
