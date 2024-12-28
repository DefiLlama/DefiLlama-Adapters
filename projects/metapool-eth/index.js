const ADDRESSES = require('../helper/coreAssets.json')
const token = '0x48afbbd342f64ef8a9ab1c143719b63c2ad81710'

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalSupply', target: token, });
  api.add(ADDRESSES.null, supply)
}

module.exports = {
  methodology: 'Retrieve the total underlying ETH supply',
  ethereum: {
    tvl
  }
}