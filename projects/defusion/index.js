const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(api) {
  const supply = await api.call({  abi: 'erc20:totalSupply', target: '0xCdde1f5D971A369eB952192F9a5C367f33a0A891'})
  api.add(ADDRESSES.tomochain.TOMO, supply)
}

module.exports.tomochain = {
  tvl
} 
