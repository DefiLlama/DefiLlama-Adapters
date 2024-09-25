const { fetchURL } = require("../helper/utils")
const BigNumber = require("bignumber.js");

const tvl = async () => {
  const res = await fetchURL("https://bonzo-data-api-eceac9d8a2aa.herokuapp.com/stats");
  const result = {};
  const reserves = res.data.reserves;  
  for(let i = 0 ; i < reserves.length; i ++) {
    const tokenId = reserves[i].coingecko_id;
    const tinytoken = reserves[i].available_liquidity.tiny_token;
    const decimals = reserves[i] .decimals;
    result[tokenId] = BigNumber(tinytoken).shiftedBy(-decimals);
  }
  return result;

  // Alternate: Just return rollup in hbar
  // return { "hedera-hashgraph": BigNumber(res.data.total_liquidity_value.hbar_tinybar).shiftedBy(-8) };
}

const borrowed = async () => {
  const res = await fetchURL("https://bonzo-data-api-eceac9d8a2aa.herokuapp.com/stats");
  const result = {};
  const reserves = res.data.reserves;  
  for(let i = 0 ; i < reserves.length; i ++) {
    const tokenId = reserves[i].coingecko_id;
    // Note: for new we only suppport variable debt
    const tinytoken = reserves[i].total_variable_debt.tiny_token;
    const decimals = reserves[i] .decimals;
    result[tokenId] = BigNumber(tinytoken).shiftedBy(-decimals);
  }
  return result;

  // Alternate: Just return rollup in hbar
  // return { "hedera-hashgraph": BigNumber(res.data.total_borrowed_value.hbar_tinybar).shiftedBy(-8) };
}

module.exports = {
  timetravel: false,
  methodology: 'The calculated TVL is the current USD sum of deposits minus borrows for all all reserves found under https://app.bonzo.finance/',
  hedera: {
    tvl,
    borrowed
  },
  external: [
    {
      website: 'https://bonzo.finance/',
      twitter: 'https://twitter.com/bonzo_finance',
      discord: 'https://bonzo.finance/discord',
    },
  ],
}