const scTreasury  = "KGNCP3PMGIJUAMD7NO5G3SSTYOO74HGYAS72EE34YTXYLRN3ZVQBYXZA3U";
const notiboyTreasury = "NOTILXUG675YH2JBO3NP5BXADEWRWHPOM5VBIWE6Z3AQU3QKGKMEPNZJRE";

const { sumTokens} = require('../helper/chain/algorand')

async function treasury() {
  const balances = await sumTokens({ 
    owners: [scTreasury,notiboyTreasury],
  })
  return balances
}

async function tvl(){
  return 0;
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
    treasury
  }
}
