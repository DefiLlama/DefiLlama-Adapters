const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function wan() {
  var totalTvl = await utils.fetchURL('https://rpc.zookeeper.finance/api/v1/tvl');
  return totalTvl.data;
}

async function avax() {
  const totalTvl = await utils.fetchURL('https://farming-api.vercel.app/api/avalanche/tvl')
  return totalTvl.data;
}

async function fetch() {
  return (await wan())+(await avax())
}

module.exports = {
  methodology: `Zookeeper's TVL is achieved by making a call to it's API: https://rpc.zookeeper.finance/api/v1/tvl (Wanchain) and https://farming-api.vercel.app/api/avalanche/tvl (AVAX).`,
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: false,
  incentivized: true,
  avax:{
    fetch: avax
  },
  wan:{
     fetch: wan
  },
  fetch,
}
