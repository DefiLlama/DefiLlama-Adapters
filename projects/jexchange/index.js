const { sumTokens } = require("../helper/chain/elrond");
const { getConfig } = require('../helper/cache')

async function tvl() {
  const pools = await getConfig('jexchange', 'https://api.jexchange.io/pools/v3')
  const owners = [
    ...pools.map(pool => pool.sc_address),
    "erd1qqqqqqqqqqqqqpgqmmxzmktd09gq0hldtczerlv444ykt3pz6avsnys6m9",
    "erd1qqqqqqqqqqqqqpgqdh6jeeyamfhq66u7rmkyc48q037kk8n26avs400gg8",
  ];
  return sumTokens({ owners });
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
