const ADDRESSES = require('../helper/coreAssets.json')
const token = '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549'

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalUnderlyingSupply', target: token, });
  api.add(ADDRESSES.null, supply)
}

module.exports = {
  methodology: 'Retrieve the total underlying ETH supply',
  ethereum: {
    tvl
  }
}
