const rmmTVL = require('./rmm')
const v1TVL = require('./v1')

function sumObjectsByKey(...objs) {
  return objs.reduce((a, b) => {
    for (let k in b) {
      if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k]
    }
    return a
  }, {})
}

async function tvl(timestamp, block) {
  const [rmm] = await Promise.all([rmmTVL(timestamp, block)])
  const [v1] = await Promise.all([v1TVL(timestamp, block)])
  return sumObjectsByKey(rmm, v1)
}

module.exports = {
  methodology: 'balanceOf',
  ethereum: {
    start: 1647932400, // unix timestamp (utc 0) specifying when the project began, or where live data begins
    tvl, // tvl adapter
  },
}
