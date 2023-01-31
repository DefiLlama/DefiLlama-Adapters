const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");

async function tvl() {
  const bondedTokens = {};
  // const bondedURL = `https://rest.stargaze-apis.com/cosmos/staking/v1beta1/pool`;
  const denomURL = `https://rest.stargaze-apis.com/cosmos/staking/v1beta1/params`;
  const bidsURL = `https://metabase.constellations.zone/api/public/card/4bd16e60-7e77-4206-8ad2-8b04f362afed/query`

  //const bondedResponse = await utils.fetchURL(bondedURL);
  const bidsResponse = await utils.fetchURL(bidsURL);
  const denomResponse = await utils.fetchURL(denomURL);

  const tokenInfo = generic(denomResponse.data.params.bond_denom);
  console.log(bidsResponse.data.data.rows[0]);
  console.log(tokenInfo);

  sdk.util.sumSingleBalance(bondedTokens, tokenInfo[0], parseFloat(bidsResponse.data.data.rows[0]))

  //bondedTokens[tokenInfo[0]] = bidsResponse.data.data.rows[0];
  console.log(bondedTokens);

  return bondedTokens;
}


function generic(ticker) {
  switch (ticker) {
    case "ustars":
      return ["stars", 6];
  }
}


module.exports = {
  timetravel: false,
  methodology: 'Queries the chain API for the current bonded tokens.',
  stars: { tvl, }
};