const axios = require("axios");

const tvlUrl = "https://api.aliens.farm/api/aliensfarm/tvl";

const fetch = async () => {
  const { data: tvl } = await axios.get(tvlUrl);

  return tvl;
};

module.exports = {
  methodology:
    "TVL counts the total cost of tokens staked on both farmings and stakings.",
  fetch,
};
