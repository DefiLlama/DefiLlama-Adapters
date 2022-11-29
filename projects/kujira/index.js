const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos')

const USK_MARKETS = [
  "kujira1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2smfdslf",
];

async function tvl() {
  const { pairs } = await get("https://api.kujira.app/api/coingecko/pairs");
  const { contracts: blackWhaleVaults } = await get(endPoints.kujira + "/cosmwasm/wasm/v1/code/16/contracts?pagination.limit=100");
  const owners = [
    ...pairs.map((pair) => pair.pool_id),
    ...USK_MARKETS,
    ...blackWhaleVaults,
  ]
  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  kujira: {
    tvl,
  },
}