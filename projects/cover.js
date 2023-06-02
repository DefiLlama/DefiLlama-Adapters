const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abis = require('./config/cover/cover.js')
const { sumTokens } = require('./helper/unwrapLPs');

async function tvl(ts, block) {

  let factory = '0xedfC81Bf63527337cD2193925f9C0cF2D537AccA';
  const { output: allProtocols } = await sdk.api.abi.call({
    block,
    target: factory,
    abi: abis.abis.protocols.getAllProtocolAddresses
  })

  const calls = allProtocols.map(p => ({ target: p }))
  const { output: protocolDetails } = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: abis.abis.cover.getProtocolDetails
  })
  const toa = []

  protocolDetails.forEach(({ output }) => {
    output._allCovers.forEach(cover => toa.push(
      [ADDRESSES.ethereum.DAI, cover],  // DAI
      ['0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01', cover],  // yearn DAI
    ))
  })
  return sumTokens({}, toa, block)
}


module.exports = {
  ethereum: {
    tvl
  }
}
