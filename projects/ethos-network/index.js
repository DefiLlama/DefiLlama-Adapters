const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const VOUCH_CONTRACT = '0xD89E6B7687f862dd6D24B3B2D4D0dec6A89A6fdd';
const NATIVE_ETH = ADDRESSES.null;

/** @type {(api: any) => Promise<void>} */
async function tvl(api) {
  return sumTokens2({ 
    owner: VOUCH_CONTRACT,
    tokens: [NATIVE_ETH],
    api,
  });
}

module.exports = {
  methodology:
    'Measures the total amount of ETH stored in the Vouch contract. Each vouch represents a trust relationship backed by ETH.',
  base: {
    tvl,
  },
  start: 1737500000, // Tue Jan 21 2025 22:53:20
};
