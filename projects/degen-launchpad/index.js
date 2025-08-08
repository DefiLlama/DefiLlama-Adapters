const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

// sonic
const tokens = [
  ADDRESSES.null, // ETH
];

const owner = '0xe220E8d200d3e433b8CFa06397275C03994A5123';

async function tvl(api) {
  // native crypto currency from the launchpad
  const nativeBalance = await sumTokens2({ owner, tokens, api});

  return nativeBalance;
}

module.exports = {
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  sonic: {
    tvl,
  }
}; 