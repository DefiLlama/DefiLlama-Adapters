const ADDRESSES = require('../helper/coreAssets.json')
const token = '0x5c982097b505A3940823a11E6157e9C86aF08987'

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
