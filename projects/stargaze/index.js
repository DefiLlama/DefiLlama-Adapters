const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");

async function tvl() {
  const balances = {};

  /**
   * Bids has already been converted from ustars to stars in the constellations api.  Must be converted back for tvl.
   */
  const bidsURL = `https://metabase.constellations.zone/api/public/card/4bd16e60-7e77-4206-8ad2-8b04f362afed/query`;

  const bidsResponse = await get(bidsURL);
  // const denomResponse = await utils.fetchURL(denomURL);
  sdk.util.sumSingleBalance(balances, 'ustars', bidsResponse.data.rows[0] * 1e6, 'stargaze');

  return balances;
};

async function staking() {
  const balances = {};
  const url = `https://rest.stargaze-apis.com/cosmos/staking/v1beta1/pool`;
  const response = await get(url);

  /**
   * Stargaze API reports bonded_tokens as ustars, so we do not need to do any conversion.
   */
  sdk.util.sumSingleBalance(balances, 'ustars', response.pool.bonded_tokens, 'stargaze');
  
  return balances;
};

module.exports = {
  timetravel: false,
  methodology: 'Queries Constellations API for how many $STARS are locked in bids.',
  stargaze: {
    tvl,
    staking
  }
};
