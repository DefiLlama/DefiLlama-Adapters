const utils = require('../helper/utils');
const web3 = require('../config/web3.js');

async function bsc() {
  return priceInfo(56);
}

async function polygon() {
  return priceInfo(137);
}

async function priceInfo(chainId) {
  const response = await utils.fetchURL('https://api.fletaconnect.io/priceInfo?chainid='+chainId);

  let tvl = 0;
  const pools = response.data.poolInfo;
  for (let i in pools) {
    let p = pools[i];
    tvl += web3.utils.fromWei(p.tvl)-0;
  }

  return tvl;
}

module.exports = {
  bsc: {
    tvl: bsc
  },
  tvl: sdk.util.sumChainTvls([bsc])
}
