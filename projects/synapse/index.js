const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens,  } = require("../helper/unwrapLPs")
const { sumTokens: sumTokensCosmos, } = require('../helper/chain/cosmos')
const sdk = require("@defillama/sdk")
const { getChainTransform, getFixBalances } = require("../helper/portedTokens")
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
    chainExport[exportKey] = async (ts, _block, { [chain]: block }) => {
      const balances = {}
      let tokensAndOwners = []
      pools.forEach(({ pool, tokens }) => {
        tokens.forEach(token => tokensAndOwners.push([token, pool]))
      })
      await sumTokens(balances, tokensAndOwners, block, chain)
      if (bridge) {
        const { address, tokens } = bridge
        tokensAndOwners = tokens.map(t => [t, address])
        await sumTokens(balances, tokensAndOwners, block, chain)
        const transform = await getChainTransform(chain)
        const balance = await sdk.api.eth.getBalance({ target: address, block, chain })
        sdk.util.sumSingleBalance(balances, transform(nullAddress), balance.output)
      }
      (await getFixBalances(chain))(balances);
      return balances
    }
  })
})

module.exports.ethereum.pool2 = async (ts, block) => {
  return sumTokens({}, [
     ['0x4a86c01d67965f8cb3d0aaa2c655705e64097c31', '0xd10ef2a513cee0db54e959ef16cac711470b62cf', ]
  ], block)
}

module.exports.terra = {}
module.exports.terra.tvl = async (timestamp, ethBlock, { terra: block }) => {
	return sumTokensCosmos({ owner: 'terra1qwzdua7928ugklpytdzhua92gnkxp9z4vhelq8', chain: 'terra'})
}
module.exports.hallmarks = [
        [1651881600, "UST depeg"],
      ]
