const ADDRESSES = require('./helper/coreAssets.json')
const abis = require('./config/cover/cover.js')

async function tvl(api) {
  let factory = '0xedfC81Bf63527337cD2193925f9C0cF2D537AccA'
  const allProtocols = await api.call({  abi: abis.abis.protocols.getAllProtocolAddresses, target: factory })
  const details  = await api.multiCall({  abi: abis.abis.cover.getProtocolDetails, calls: allProtocols})
  const tokens = [ADDRESSES.ethereum.DAI, '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01']
  const owners = details.map(i => i._allCovers).flat()
  return api.sumTokens({ owners, tokens })
}


module.exports = {
  ethereum: {
    tvl
  }
}
