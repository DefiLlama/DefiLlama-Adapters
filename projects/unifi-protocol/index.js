const BigNumber = require("bignumber.js");
const utils = require('../helper/utils');

function fetchChain(chainTokenName) {
  return async () => {
    const { data } = await utils.fetchURL('https://web-api.unifi.report/api/data.json');
    const chainInfo = data.find(chain => chain.blockChainShort === chainTokenName)
    if (chainInfo) {
      const result = new BigNumber(chainInfo.liquidityUsd).toNumber()
      return result
    }
    throw new Error("tvl is 0")
  }
}

async function fetchTvl() {
  const { data } = await utils.fetchURL('https://web-api.unifi.report/api/data.json');
  const result = data.reduce((tvl, curr) => {
    return tvl.plus(curr.liquidityUsd)
  }, new BigNumber(0))
  return result.toNumber()
}

module.exports = {
  bsc: {
    fetch: fetchChain('BNB')
  },
  polygon: {
    fetch: fetchChain('MATIC')
  },
  fetch: fetchTvl
}