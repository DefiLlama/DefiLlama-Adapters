const { sumTokens } = require("../helper/chain/elrond");
const { getConfig } = require('../helper/cache')

async function tvl() {
  const pools = await getConfig('jexchange-pools', 'https://api.jexchange.io/pools/v3')
  const owners = [
    ...pools.map(pool => pool.sc_address),
    "erd1qqqqqqqqqqqqqpgqmmxzmktd09gq0hldtczerlv444ykt3pz6avsnys6m9",
    "erd1qqqqqqqqqqqqqpgqdh6jeeyamfhq66u7rmkyc48q037kk8n26avs400gg8",
  ];
  return sumTokens({ owners });
}

async function staking() {
  const farms = await getConfig('jexchange-farms', 'https://api.jexchange.io/farms')
  const owners = [
    ...farms.map(farm => farm.sc_address),
    "erd1qqqqqqqqqqqqqpgq05whpg29ggrrm9ww3ufsf9ud23f66msv6avs5s5xxy",
  ];
  return sumTokens({ owners });
}

module.exports = {
  timetravel: false,
  elrond: {
    staking,
    tvl,
  },
};
