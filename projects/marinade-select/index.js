const { getStakedSol } = require('../helper/solana')

async function tvl(api) {
  await getStakedSol('STNi1NHDUi6Hvibvonawgze8fM83PFLeJhuGMEXyGps', api)
}

module.exports = {
  solana: { tvl }
}
