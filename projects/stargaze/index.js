const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");

async function tvl() {
  const bondedTokens = {};

  /**
   * The denom is the official API.  bids was custom made for this use.  @pen.so on #Stargaze
   */

  const denomURL = `https://rest.stargaze-apis.com/cosmos/staking/v1beta1/params`;
  const bidsURL = `https://metabase.constellations.zone/api/public/card/4bd16e60-7e77-4206-8ad2-8b04f362afed/query`

  /* 
   * Fetach and store the JSON data 
  */
  const bidsResponse = await utils.fetchURL(bidsURL);
  const denomResponse = await utils.fetchURL(denomURL);

  const tokenInfo = denomFix(denomResponse.data.params.bond_denom);
  
  /**
   * Debugging
   */
  // console.log(bidsResponse.data.data.rows[0]);
  // console.log(tokenInfo);

  /**
   * This stores the tvl in bids into bondedTokens and sets coingecko id to stargaze
   */
  sdk.util.sumSingleBalance(bondedTokens, tokenInfo[1], parseFloat(bidsResponse.data.data.rows[0]))

  /**
   * Debugging
   */
  // console.log(bondedTokens);

  return bondedTokens;
}


function denomFix(ticker) {
  switch (ticker) {
    case "ustars":
      /**
       * denome, coingecko, decimal
       */
      return ["stars", "stargaze", 6];
  }
}


module.exports = {
  timetravel: false,
  methodology: 'Queries the chain API for the how many STARS are locked in bids.',
  stars: { tvl }
};
