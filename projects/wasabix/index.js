const utils = require('../helper/utils');
const sdk = require('@defillama/sdk');

const endpoint = "https://liquity.wasabix.finance/api/stats/TVL"

async function eth() {
  const data = await utils.fetchURL(endpoint);
  return {"dai":data.data.ETH.totalL};
}


async function bsc() {
  const data = await utils.fetchURL(endpoint);
  return {"dai":data.data.BSC.totalL};
}


module.exports = {
  ethereum:{
    tvl: eth
  },
  bsc: {
    tvl: bsc
  },
  tvl: sdk.util.sumChainTvls([eth, bsc])
}
