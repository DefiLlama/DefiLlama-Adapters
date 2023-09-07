const axios = require('axios').default

async function tvl(_, _1, _2, { api }) {
  await axios.get('https://smart-vault-api.thestandard.io/stats')
    .then(data => {
      const { tvl } = data.data;
      tvl.forEach(asset => {
        api.add(asset.address, asset.amount);
      });
    })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'counts the aggregated assets locked in The Standard Smart Vaults.',
  arbitrum: {
    tvl,
  }
};