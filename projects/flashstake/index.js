const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking')
// const { getLogs } = require('../helper/cache/getLogs')
const { getConfig } = require('../helper/cache')

const config = {
  ethereum: { protocol: '0x78b2d65dd1d3d9fb2972d7ef467261ca101ec2b9', fromBlock: 15233959, },
  optimism: { protocol: '0x78b2d65dd1d3d9fb2972d7ef467261ca101ec2b9', fromBlock: 31242674, },
}

let configData

async function getData() {
  if(!configData) configData =  getConfig('flashstake', 'https://api.flashstake.io/helper/whitelistedStrategies')
  return configData
}

module.exports = {
  doublecounted: true,
  start: 1659312000,
  hallmarks: [
    [1659312000, "Protocol Launch"],
    [1666641600, "Optimism Launch"],
    [1674604800, "Flash Capacitor Launch"],
    [1676484000, "Flido Launch"]
  ]
};

Object.keys(config).forEach(chain => {
  // const { fromBlock, protocol, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}
      // const logs = await getLogs({
      //   api,
      //   fromBlock,
      //   topics: ['0xc775f148b1505cf5c3c3158b3bd09e79026cae37c17f0851eff0cac3a39027fb'],
      //   target: protocol,
      //   eventAbi: 'event StrategyRegistered(address indexed strategy, address indexed principal, address indexed _fTokenAddress)',
      // })
      const data = await getData()
      const strategy = Object.keys(data[chain])
      const [
        principal,
        bals,
        bals2,
      ] = await Promise.all([
        api.multiCall({  abi: 'address:getPrincipalAddress', calls: strategy}),
        api.multiCall({  abi: 'uint256:getPrincipalBalance', calls: strategy}),
        api.multiCall({  abi: 'uint256:getYieldBalance', calls: strategy}),
      ])
      bals.forEach((bal, i) => sdk.util.sumSingleBalance(balances,principal[i],bal, api.chain))
      bals2.forEach((bal, i) => sdk.util.sumSingleBalance(balances,principal[i],bal, api.chain))
      return balances
    }
  }

  if (chain === 'ethereum') {
    module.exports.ethereum.pool2 = staking([
      "0xcb1205ac28693beda01e0b66e9b4d06231609bfd",
      "0x57d551a18aae2c9de6977425f1df34dcd5db4977",
    ], '0xb1c33de7a914f4d9ba293a055822cbc6e662a698')
    module.exports.ethereum.staking = staking("0xb89494ab70001a2f25372b5e962046908188feea", '0xb1f1f47061a7be15c69f378cb3f69423bd58f2f8')
  }
})
