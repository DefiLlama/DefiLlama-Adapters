const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json')

const HEX = ADDRESSES.pulse.HEX
async function staking(api) {
  const globalInfo = await api.call({ abi: abi.globalInfo, target: HEX })
  api.add(HEX, globalInfo[0])
}

module.exports = {
  ethereum: {
    staking: () => ({}), // this is no longer done on ethereum
    tvl: () => ({})
  }
}