const ADDRESSES = require('../helper/coreAssets.json')
const BASE3D_MAIN_CONTRACT = '0xa73fab6e612aaf9125bf83a683aadcdd6511d3f0';

async function tvl(api) {
  return api.sumTokens({ owner: BASE3D_MAIN_CONTRACT, tokens: [ADDRESSES.null] });  
}

module.exports = {
  base: {
    tvl,
  },
  methodology: 'Calculates TVL by checking the ETH balance of the main contract via the totalEthereumBalance function.',
  start: 3331748,
};
