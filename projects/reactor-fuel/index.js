const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const contractId = '0xe0eeb0f14dbc2793a1fb701c507f184f6d44f1cee08f83fe3837b8ef41f55818'

  return sumTokens({ api, owner: contractId })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}
