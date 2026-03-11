const ADDRESSES = require('../helper/coreAssets.json')

const VOUCH_CONTRACT = '0xD89E6B7687f862dd6D24B3B2D4D0dec6A89A6fdd';
const NATIVE_ETH = ADDRESSES.null;

async function tvl(api) {
  return api.sumTokens({ owner: VOUCH_CONTRACT, tokens: [NATIVE_ETH] });
}

module.exports = {
  methodology: 'Measures the total amount of ETH stored in the Vouch contract. Each vouch represents a trust relationship backed by ETH.',
  base: { tvl },
  start: '2025-01-21',
};