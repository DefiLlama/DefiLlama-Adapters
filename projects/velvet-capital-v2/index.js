const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const axios = require("axios");

async function tvl(_, _b, _cb, { api, }){
  const response = await axios.get('https://defivas.org/api/v2/portfolio/all');
  const data = response.data.data;
  const indexes = data.map(items=> items.indexSwap);
  const [tokens,vaults] = await Promise.all([
    api.multiCall({ abi: 'address[]:getTokens', calls: indexes}),
    api.multiCall({ abi: 'address:vault', calls: indexes }),
  ])

  const ownerTokens = tokens.map((tokens,i)=> [tokens,vaults[i]]);
  return sumTokens2({api,ownerTokens,resolveLP:true});
}

module.exports = {
  methodology: 'calculates overall value deposited across different protocol portfolios',
  bsc: { tvl }
}
