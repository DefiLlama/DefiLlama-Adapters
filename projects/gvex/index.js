const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_CONTRACT = '0xf172eCF8230fc4F2a5C6531690F91306d0079f53';

async function tvl(api) {
  // Use native token summation (backend price mapping should handle pricing)
  return api.sumTokens({ owners: [VAULT_CONTRACT], tokens: [ADDRESSES.null] });
}

module.exports = {
  methodology: 'Counts the total native GPU tokens deposited in the GPUVault contract.',
  start: 4430679,
  gan: {
    tvl,
  }
};
