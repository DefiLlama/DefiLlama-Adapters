const ADDRESSES = require('../helper/coreAssets.json')
const token = '0xc2387E0feA344D1edEC3E93Bf2124f909f74938C'

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalSupply', target: token, });
  api.add(ADDRESSES.null, supply)
}

module.exports = {
  methodology: 'Retrieve the total myPLUME supply. myPLUME is a liquid staking token for PLUME, the native token on the Plume network. The TVL is calculated by summing the total supply of myPLUME.',
  plume_mainnet: {
    tvl
  }
}
