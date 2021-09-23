const utils = require('./helper/utils');

async function fetchChain(chainId) {
  let url;
  switch (chainId) {
    case 'ontology':
      url = 'https://flashapi.wing.finance/api/v1/flashpooldetail';
      break;
    case 'ethereum':
      url = 'https://ethapi.wing.finance/eth/flash-pool/detail';
      break;
    case 'okexchain':
      url = 'https://ethapi.wing.finance/okexchain/flash-pool/detail';
      break;
  };
  const response = await utils.fetchURL(url);
  let tvl = response.data.result.totalSupply - response.data.result.totalBorrow;
  if (!tvl) {
    tvl = response.data.result.TotalSupply - response.data.result.TotalBorrow;
  }
  return tvl;
}
async function fetch() {
  const tvl = await utils.fetchURL('https://api.wing.finance/wing/analytics/tvl-overview')
  return tvl.data.result.overview.totalSupply - tvl.data.result.overview.totalBorrow;
}
async function stake(chainId) {
  let url;
  switch (chainId) {
    case 'ontology':
      url = 'https://flashapi.wing.finance/api/v1/flashpooldetail';
      break;
    case 'ethereum':
      url = 'https://ethapi.wing.finance/eth/flash-pool/detail';
      break;
    case 'okexchain':
      url = 'https://ethapi.wing.finance/okexchain/flash-pool/detail';
      break;
  };
  const response = await utils.fetchURL(url);
  let staked = response.data.result.totalLockedWingDollar;
  if (!staked) {
    staked = response.data.result.TotalLockedWingDollar;
  }
  return staked;
}

module.exports = {
  ontology:{
    fetch: fetchChain('ontology'),
    staking: stake('ontology')
  },
  ethereum:{
    fetch: fetchChain('ethereum'),
    staking: stake('ethereum')
  },
  okexchain:{
    fetch: fetchChain('okexchain'),
    staking: stake('okexchain')
  },
  fetch,
  methodology: `Wing Finance TVL is achieved by subtracting total borrow from total supply on each chain. Staking is calculated by finding the dollar value of locked WING on each chain. The values are fetched from Wing Finance's own API.`
}
// node test.js projects/wing.js
// node projects/wing.js