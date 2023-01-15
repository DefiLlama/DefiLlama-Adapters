const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos');
const { hexValue } = require("@ethersproject/bytes");


async function tvl() {
  const { pairs } = await get("https://api.kujira.app/api/coingecko/pairs");
  const blacklist = [
    'kujira1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgesw2pujt',
    'kujira1gl8js9zn7h9u2h37fx7qg8xy65jrk9t4zpa6s7j5hdlanud2uwxshqq67m'
  ]
  let owners = [
    ...pairs.map((pair) => pair.pool_id),
  ]

  owners = owners.filter(item => {
      return !blacklist.includes(item);
  })

  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  kujira: {
    tvl,
  },
}

