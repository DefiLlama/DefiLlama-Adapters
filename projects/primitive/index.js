const rmmTVL = require('./rmm')

async function tvl(timestamp, block) {
  const [rmm] = await Promise.all([rmmTVL(timestamp, block)])
  return rmm
}

module.exports = {
  methodology: 'balanceOf',
  ethereum: {
    start: 1647932400, // unix timestamp (utc 0) specifying when the project began, or where live data begins
    tvl, // tvl adapter
  },
}
