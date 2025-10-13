const { call } = require('../helper/chain/starknet');
const abi = require('./abi.json');

const WBTC_CONTRACT = '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac';
const WRAPPED_WBTC_CONTRACT = '0x75d9e518f46a9ca0404fb0a7d386ce056dadf57fd9a0e8659772cb517be4a18'; // The collateral is a wrapped WBTC, for decimals reasons

async function tvl(api) {
  const wrapperBalance = await call({
    abi: abi[0],
    target: WBTC_CONTRACT,
    params: [WRAPPED_WBTC_CONTRACT],
  });

  api.addTokens([WBTC_CONTRACT], [wrapperBalance])
}

module.exports = {
  methodology: 'counts the number of WWBTC tokens in the Active and Default pools contracts.',
  start: 2762980,
  starknet: {
    tvl,
  }
}; 