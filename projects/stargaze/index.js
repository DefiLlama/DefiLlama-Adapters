const sdk = require("@defillama/sdk");
const { get } = require('../helper/http')

async function tvl() {
  const balances = {};

  /**
   * The denom is the official API.  bids was custom made for this use.  @pen.so on #Stargaze
   * Bids has already been converted from ustars to stars.
   */

  // const denomURL = `https://rest.stargaze-apis.com/cosmos/staking/v1beta1/params`;
  const bidsURL = `https://metabase.constellations.zone/api/public/card/4bd16e60-7e77-4206-8ad2-8b04f362afed/query`

  const bidsResponse = await get(bidsURL);
  // const denomResponse = await utils.fetchURL(denomURL);
  sdk.util.sumSingleBalance(balances, 'ustars', bidsResponse.data.rows[0] * 1e6, 'stargaze')

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: 'Queries the chain API for the how many STARS are locked in bids.',
  stargaze: { tvl }
};
