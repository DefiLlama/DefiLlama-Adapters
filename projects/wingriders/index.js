const { post } = require('../helper/http')

const headers = {
  "Accept-Encoding": "gzip, deflate, br",
};

/** @returns {Promise<{tvl: string, staking: string}>} */
async function getTvlBreakdown() {
    const res = await post(
        'https://api.mainnet.wingriders.com/graphql',
        {
            query: '{tvlBreakdown {tvl, staking}}'
        },
        { headers }
    )
    return res.data.tvlBreakdown
}

async function tvl() {
  const tvlBreakdown = await getTvlBreakdown()
  return {cardano: Number(tvlBreakdown.tvl)}
}

async function staking() {
  const tvlBreakdown = await getTvlBreakdown()
  return {cardano: Number(tvlBreakdown.staking)}
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking,
  },
  hallmarks: [
    [1659312000,"Nomad Bridge Hack"]
  ],
};
