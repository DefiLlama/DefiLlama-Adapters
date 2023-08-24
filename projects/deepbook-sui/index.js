const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')

async function tvl(ts) {
  const {data} = await get('https://49490zsfv2.execute-api.us-east-1.amazonaws.com/sui/deepbook?interval=hour&timeFrame=1&dataType=tvl')
  return toUSDTBalances(findClosestTvl(data, ts)) 
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  sui: {
    tvl
  }
}

function findClosestTvl(data, ts) {
  ts = ts * 1000
  data.forEach(i => i.ts = new Date(i.timestamp))
  data = data.filter(i => i.ts < ts && (ts -i.ts) < 86400000) // filter for recent tvl but less than day old
  data.sort((a, b) => b.ts - a.ts)
  return data[0].tvl
}