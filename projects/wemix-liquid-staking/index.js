const ADDRESSES = require('../helper/coreAssets.json')
const token = '0x9B377bd7Db130E8bD2f3641E0E161cB613DA93De'

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalSupply', target: token, });
  api.add(ADDRESSES.null, supply)
}

module.exports = {
  methodology: 'Retrieve the total underlying stWemix supply',
  wemix: {
    tvl
  }
}
