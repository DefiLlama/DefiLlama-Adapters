const axios = require("axios");

const headers = {
  "Accept-Encoding": "gzip, deflate, br",
};

async function tvl() {
    const res = await axios.post(
        'https://api.mainnet.wingriders.com/graphql',
        {
            query: '{tvl}'
        },
        { headers }
    )
    const tvl = Number(res.data.data.tvl)
    return {cardano: tvl}
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
  hallmarks: [
    [1659312000,"Nomad Bridge Hack"]
  ],
};
