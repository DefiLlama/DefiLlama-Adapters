const {getConfig} = require('../helper/cache')

async function tvl() {
  try {
    return await getConfig('quasar-vaults', 'https://api.quasar.fi/vaults/total_tvl')
  } catch (error) {
    console.error('Error fetching total TVL:', error);
    return {};
  }
}

module.exports = {
    timetravel: false,
    methodology: 'Total TVL on vaults',
    osmosis: {
        tvl,
    },
}
