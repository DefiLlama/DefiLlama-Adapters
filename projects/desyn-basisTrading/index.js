module.exports = {
    doublecounted: true,
    methodology: 'Combines on-chain airdrops with stable returns from basis trading on Binance.',
  }
  
  const config = {
    ethereum: {
      safePools: ["0x5913F1C0Cbcbace8De647a64489D7a4f7319278F"]            // PUSDT2
     
    },
    arbitrum: {
      safePools: []
    },
    merlin: {
      safePools: []
    },
    btr: {
      safePools:[]
    },
    mode: {
      safePools: []
    },
    zklink: {
      safePools: []
    },
    core: {
      safePools: []
    },
    ailayer: {
      safePools: []
    }
  }
  
  const abi = {
    getBalance: "function getBalance(address) view returns (uint256)"
  }
  
  Object.keys(config).forEach(chain => {
    const { safePools } = config[chain]
    module.exports[chain] = {
      tvl: async (api) => {
        const pools = safePools
        const tokens = await api.multiCall({  abi: 'address[]:getCurrentTokens', calls: pools})
        const calls = []
        const allTokens = []
        let i = 0
        for (const pool of pools) {
          for (const token of tokens[i]) {
            calls.push({ target: pool, params: token })
            allTokens.push(token)
          }
          i++
        }
        const allBals = await api.multiCall({ abi: abi.getBalance, calls })
        api.add(allTokens, allBals)
      }
    }
  })