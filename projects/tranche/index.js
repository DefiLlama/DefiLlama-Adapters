const sdk = require('@defillama/sdk');
const axios = require('axios');
const _ = require('underscore');



async function getTvl (network) {
  const resp = await axios.get(`https://dev.tranche.finance/api/v1/common/tvl/${ network }`);
  return resp.data.result;
}

async function ethTvl () {
  return getTvl('ethereum');
}
async function polygonTvl () {
  return getTvl('polygon');
}

async function fantomTvl () {
  return getTvl('ftm');
}

async function avaxTvl () {
  return getTvl('avax');
}


async function tvl(timestamp, block) {
  const balances = {};

  // returns undefined in test script
  let tokenList = await axios.get('https://api.tranche.finance/api/v1/common/token-address?network=ethereum');
  let holderList = await axios.get('https://api.tranche.finance/api/v1/common/holder-address?network=ethereum');
  tokenList = tokenList.data.result;
  holderList = holderList.data.result;

  const calls = [];
  _.each(tokenList, (token) => {
    _.each(holderList, (contract) => {
      calls.push({
        target: token,
        params: contract
      })
    })
  });

  const balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: 'erc20:balanceOf'
  });
  sdk.util.sumMultiBalanceOf(balances, balanceOfResults);
  console.log(balances);

  return balances;
}


async function fetch () {
  return await ethTvl() + await polygonTvl() + await fantomTvl() + await avaxTvl();
}

module.exports = {
  start: 1621340071,
  ethereum: {
    fetch: ethTvl
  },
  polygon: {
    fetch: polygonTvl
  },
  avax: {
    fetch: avaxTvl
  },
  fantom: {
    fetch: fantomTvl
  },
  fetch
}