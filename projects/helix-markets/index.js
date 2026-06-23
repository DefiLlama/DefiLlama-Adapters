const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl() {
  const url = 'https://dgw.helixic.io/api/v1/tvl';
  const data = await get(url);
  let totalVolumeNotional = 0;
  data.forEach(asset => {
    totalVolumeNotional += parseFloat(asset.volumeNotional);
  });
  return toUSDTBalances(totalVolumeNotional);
}