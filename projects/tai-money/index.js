const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  ethereum: {
    coinJoins: {
      "GEB_JOIN_ETH_A": "0xf6c35af06ed2d97f62b31d7030370f8ae33bd3b1",
      "GEB_JOIN_ETH_B": "0xa822e24f944127f445d8ad30adcddd721a5616e9",
      "GEB_JOIN_ETH_C": "0x793a0de4db6f96cf30d371ef28278496b66223f8",
      "GEB_JOIN_WSTETH_A": "0x5d527c9641effeb3802f2ffafdd15a1b95e41c8c",
      "GEB_JOIN_WSTETH_B": "0x9e240daf92dd0edf903def1ff1dd036ca447aaf7",
      "GEB_JOIN_RETH_A": "0xf4e8267f05cf1ead340ac7f2bff343528526f16b",
      "GEB_JOIN_RETH_B": "0x7daedd26e1202897c9c6bf3967fb5ae45616aef5",
      "GEB_JOIN_RAI_A": "0x67b97de3f10ad081fbddf36099699d5ab488828e",
      "GEB_JOIN_CBETH_A": "0x10ff8d4376798f920fae147f109157fa6b9a985b",
      "GEB_JOIN_CBETH_B": "0xb4941d2a62421adc6ce939cb466f884535bfbff9",
    },
  },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  let { coinJoins } = config[chain]
  coinJoins = Object.values(coinJoins)
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:collateral', calls: coinJoins })
      return sumTokens2({ api, tokensAndOwners2: [tokens, coinJoins]})
    }
  }
})