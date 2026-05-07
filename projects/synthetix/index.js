const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
// const {getExports} = require('../helper/heroku-api')
// const chains = ['ethereum', 'optimism']

module.exports = {
  timetravel: false,
  optimism: { tvl: () => ({}) },
  ethereum: { tvl: () => ({}), staking },
  // ...getExports("synthetix", chains)
  methodology: `Counts the value of all SNX staked in the 420 pool & legacy escrow contracts under staking`,
}

async function getStakingData(api) {
  const { data: { rows, cols } } = await get('https://metabase.synthetix.io/api/embed/dashboard/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjE3M30sInBhcmFtcyI6e30sImV4cCI6MTc1NDQ4MDc5NiwiaWF0IjoxNzU0NDgwMTk1fQ.BrR7T9nZpFtZXyQ7nMhT28Oueh3qNU2AeXuiy2elRDk/dashcard/508/card/566?parameters=%7B%7D')

  const lastRow = rows[rows.length - 1]
  const simpleStakedCol = cols.map(i => i.name).indexOf('simple_staked')
  const legacyStakedCol = cols.map(i => i.name).indexOf('legacy_staked')
  const totalStakedCol = cols.map(i => i.name).indexOf('total_staked')
  return {
    totalStaked: lastRow[totalStakedCol],
    simpleStaked: lastRow[simpleStakedCol],
    legacyStaked: lastRow[legacyStakedCol],
  }
}

// staking in the 420 pool
async function staking(api) {
  const stakingData = await getStakingData(api)
  api.add(ADDRESSES.ethereum.SNX, stakingData.totalStaked * 1e18)
}