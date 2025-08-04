const { cachedGraphQuery } = require('../helper/cache')

module.exports = {
  start: 133986312,
  timetravel: false,
  sei: {
    tvl,
  }
}

const graphUrl = 'https://graph.apollon.fi/2.4.4/gn';
const usdcTokenAddress = '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1';
async function tvl(api) {
  const calculatedTVL = await cachedGraphQuery('apollon', graphUrl, `
    query {
      dailyActivities(
        orderBy: timestamp
        orderDirection: desc
        where: {tvlUSD_gt: "0"}
        first: 1
      ) {
        tvlUSD
      }
    }
  `);
  api.add(usdcTokenAddress, calculatedTVL.dailyActivities[0].tvlUSD / 1e12); // 1e18 -> 1e6

  return api.getBalances();
}
