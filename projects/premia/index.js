const { staking } = require('../helper/staking')
const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: { factory: '0x4f273f4efa9ecf5dd245a338fad9fe0bab63b350', fromBlock: 13509301, optionsContract: '0x5920cb60B1c62dC69467bf7c6EDFcFb3f98548c0', optionsBaseToken: ADDRESSES.ethereum.DAI, },
  arbitrum: { factory: '0x89b36ce3491f2258793c7408bd46aac725973ba2', fromBlock: 3304690, },
  fantom: { factory: '0xD9e169e31394efccd78CC0b63a8B09B4D71b705E', fromBlock: 37104409, },
  optimism: { factory: '0x48D49466CB2EFbF05FaA5fa5E69f2984eDC8d1D7', fromBlock: 16597183, },
  bsc: { optionsContract: '0x8172aAC30046F74907a6b77ff7fC867A6aD214e4', optionsBaseToken: ADDRESSES.bsc.BUSD, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, ownerTokens = [], optionsBaseToken, optionsContract, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {

      if (factory) {
        const logs = await getLogs({
          api,
          target: factory,
          eventAbi: 'event DeployPool (address indexed base, address indexed underlying, int128 indexed initialCLevel64x64, address baseOracle, address underlyingOracle, address pool)',
          onlyArgs: true,
          fromBlock,
        })
        logs.forEach((v) => ownerTokens.push([[v.underlying, v.base], v.pool]))
      }

      if (optionsContract) {
        const tokens = await api.fetchList({ lengthAbi: "uint256:tokensLength", itemAbi: "function tokens(uint256) view returns (address)", target: optionsContract })
        if (optionsBaseToken) tokens.push(optionsBaseToken)
        ownerTokens.push([tokens, optionsContract])
      }

      return api.sumTokens({ ownerTokens })
    }
  }
})

module.exports.ethereum.staking = staking(["0x16f9d564df80376c61ac914205d3fdff7057d610", "0xF1bB87563A122211d40d393eBf1c633c330377F9"], "0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70")