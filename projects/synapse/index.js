const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2,  } = require("../helper/unwrapLPs")
const { sumTokens: sumTokensCosmos, } = require('../helper/chain/cosmos')
const config = require("./config")

const nullAddress = ADDRESSES.null

Object.keys(config).forEach(chain => {
  const chainExport = {
    tvl: () => ({}),
  }
  module.exports[chain] = chainExport
  Object.keys(config[chain]).forEach(exportKey => {
    let {
      pools = [],
      bridge,
    } = config[chain][exportKey]
    chainExport[exportKey] = async (api) => {
      let tokensAndOwners = []
      pools.forEach(({ pool, tokens }) => {
        tokens.forEach(token => tokensAndOwners.push([token, pool]))
      })
      if (bridge) {
        const { address, tokens } = bridge
        tokens.push(nullAddress)
        tokensAndOwners.push(...tokens.map(t => [t, address]))
      }
      return sumTokens2({ api, tokensAndOwners })
    }
  })
})

module.exports.ethereum.pool2 = async (api) => {
  return sumTokens2({
    api, tokensAndOwners: [
      ['0x4a86c01d67965f8cb3d0aaa2c655705e64097c31', '0xd10ef2a513cee0db54e959ef16cac711470b62cf', ]
   ]
  })
}

module.exports.terra = {}
module.exports.terra.tvl = async () => {
	return sumTokensCosmos({ owner: 'terra1qwzdua7928ugklpytdzhua92gnkxp9z4vhelq8', chain: 'terra'})
}
module.exports.hallmarks = [
        [1651881600, "UST depeg"],
      ]
