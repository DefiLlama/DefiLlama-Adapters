const ADDRESSES = require('../helper/coreAssets.json')
const { getSupply } = require('../helper/chain/keeta');

const SUPPORTED_TOKENS = [
  ADDRESSES.keeta.KTA,
  ADDRESSES.keeta.USDC,
  ADDRESSES.keeta.EURC,
]

async function tvl(api) {
  for (const token of SUPPORTED_TOKENS) {
    const supply = await getSupply(token, api.timestamp);
    api.add(token, supply);
  }
}

module.exports = {
  methodology: 'TVL is calculated as the supply of a token on the Keeta network.',
  // Date of mainnet release
  start: '2025-09-23',
  keeta: {
    tvl,
  }
}
