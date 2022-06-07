const utils = require('./helper/utils');




async function tvl() {
    const totalTvl = await utils.fetchURL('http://validators.narwallets.com:7000/metrics_json')

  return {
    near: totalTvl.data.tvl
  }
}

module.exports = {
    methodology: 'TVL counts the NEAR tokens that are staked.',
    tvl,
  }