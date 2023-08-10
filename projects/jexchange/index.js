const { sumTokens } = require("../helper/chain/elrond");

async function tvl() {
  const owners = [
    "erd1qqqqqqqqqqqqqpgqmmxzmktd09gq0hldtczerlv444ykt3pz6avsnys6m9",
    "erd1qqqqqqqqqqqqqpgqdh6jeeyamfhq66u7rmkyc48q037kk8n26avs400gg8",
    "erd1qqqqqqqqqqqqqpgqpa3pdmemt5l2ex80g7pksr2ettt955d66avsz76hyt",
    "erd1qqqqqqqqqqqqqpgq5nmzpdkpr6c5q894f553n49t0uc67vc96avsxgjl3v",
    "erd1qqqqqqqqqqqqqpgqru6tkedsjjszrkkanctgq9m6rm2ple436avs0qj07m",
    "erd1qqqqqqqqqqqqqpgquenuwz852khuxcau49md27wk2qp03v4s6avsdvmxkc",
  ];
  return sumTokens({ owners });
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
