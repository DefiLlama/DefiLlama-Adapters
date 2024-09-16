const { getLogs } = require('../helper/cache/getLogs')

const config = {
  polygon: {
    vault: '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304',
    dailyClaim: '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304',
    fromBlock: 29080112,
    tokens: {}
  },
  // linea: {
  //   vault: '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304',
  //   dailyClaim: '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304',
  //   fromBlock: 29080112,
  //   tokens: {}
  // },
  // ethereum: {
  //   vault: '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304',
  //   dailyClaim: '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304',
  //   fromBlock: 29080112,
  //   tokens: {}
  // },
}

Object.keys(config).forEach(chain => {
  const { vault, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // TODO: Refine logic. Iterate over list of tokens allowed for staking.
      // Feth locked amount and append to the responce.

      const logs = await getLogs({
        api,
        target: vault,
        eventAbi: 'event FundCreated (address indexed newFund, address comptroller, address shareToken, address vault)',
        onlyArgs: true,
        fromBlock,
      })
      const tokens = await api.multiCall({ abi: 'address[]:getAssetList', calls: logs.map(l => l.newFund) })
      const ownerTokens = tokens.map((t, i) => [t, logs[i].vault])
      return api.sumTokens({ ownerTokens })
      // TVL EXPECTED RETURN EXAMPLE (TEMP)
      // return {
      //   '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '5000000000000', // 5,000,000 USDC (since USDC has 6 decimals)
      //   '0x0000000000000000000000000000000000000000': '2000000000000000000', // 2 ETH (in wei)
      // };
    },
    // Custom metric.
    daily_claims: async (api) => {
      // logs := FilterLogs(DailyClaim, StartFrom: block24hBefore)
      // return len(logs)
      return 1000 // Temp placeholder.
    }
  }
})
