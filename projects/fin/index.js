const { getConfig } = require("../helper/cache");
const { sumTokens, } = require('../helper/chain/cosmos');

async function tvl() {
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const blacklist = [
    'kujira1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgesw2pujt',
    'kujira1gl8js9zn7h9u2h37fx7qg8xy65jrk9t4zpa6s7j5hdlanud2uwxshqq67m'
  ]
  let owners = [
    ...contracts["kaiyo-1"].fin.map(x => x.address),
  ]

  owners = owners.filter(item => {
      return !blacklist.includes(item);
  })

  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  timetravel: false,
  kujira: {
    tvl,
  },
}

