const ADDRESSES = require('../helper/coreAssets.json')

const MARKETS_CONTRACT = '0xC26F339F4E46C776853b1c190eC17173DBe059Bf';
const NATIVE_ETH = ADDRESSES.null;

async function tvl(api) {
  return api.sumTokens({ owner: MARKETS_CONTRACT, tokens: [NATIVE_ETH] });
}

module.exports = {
  methodology: 'Measures the total amount of ETH stored in the Reputation Markets contract. Markets allow trading trust/distrust votes against Ethos network profiles on an AMM.',
  base: { tvl },
  start: '2025-01-21',
};
