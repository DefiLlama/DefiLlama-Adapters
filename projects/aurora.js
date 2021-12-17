const utils = require('./helper/utils');

async function tvl() {
  const totalTvl = await utils.fetchURL('https://api.llama.fi/charts/aurora')

  return {
    near: totalTvl.data.pop().totalLiquidityUSD
  }
}

module.exports = {
    methodology: 'Includes the Aurora TVL as a project under NEAR',
    tvl,
  }