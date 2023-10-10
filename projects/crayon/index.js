const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')

// desks
const owners = [
  '0x8351483e30928D1Fe1f80eD5062c6438faa85b88',
  '0x3454923795c5EdD5b3967e3B63140c343e6BB3dF',
  '0x5dE27C6D5524EE07c0dB88CAB65022E3210a81c4',
  '0x343d5F534C4C1fB83cdDf0875cC91591cCf69416',
  '0x635b2fE7bF8d41B0477A492f953f57b40E385Cfb',
  '0xfE2A45BF13965393c863460F063bDD4a9874c415'
]; 

// all tokens, all desks
const tokens = [
  "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  "0x912CE59144191C1204E64559FE8253a0e49E6548",
  "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  "0x3082CC23568eA640225c2467653dB90e9250AaA0"
];

async function borrowed(_, _1, _2, { api } ) {
  const base_tokens = await api.multiCall({
    calls: owners.map(desk => ({
      target: desk
    })),
    abi: 'address:base_coin',
  });

  const bals = await api.multiCall({
    calls: owners.map(desk => ({
      target: desk
    })),
    abi: 'uint256:total_loans',
  });

  const borrowed_bals = {};
  bals.forEach((v, i) => sdk.util.sumSingleBalance(borrowed_bals, base_tokens[i], v));
  
  return borrowed_bals;
}

async function tvl(_, _1, _2, { api } ) {
  // owners are the desks
  const desk_owned_bals = sumTokens2({owners, tokens, api});

  return desk_owned_bals;
}

module.exports = {
  arbitrum: {
    tvl, borrowed
  }
}

