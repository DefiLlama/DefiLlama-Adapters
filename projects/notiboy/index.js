const notiboyTreasury  = "KGNCP3PMGIJUAMD7NO5G3SSTYOO74HGYAS72EE34YTXYLRN3ZVQBYXZA3U";
const { sumTokens} = require('../helper/chain/algorand')

async function tvl() {
  const balances = await sumTokens({ 
    owner: notiboyTreasury,
  })
  return balances
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl
  }
}
