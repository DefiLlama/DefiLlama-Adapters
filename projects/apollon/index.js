const config = {
  sei: { troveManager: '0x097639bD7AD4e665f7bac198CF82914e60e604e2', swapOperations: '0xf69D9cACc0140e699C6b545d166C973CB59b8E87' }
}

Object.keys(config).forEach(chain => {
  const { troveManager, swapOperations } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokenManager = await api.call({ abi: 'address:tokenManager', target: troveManager })
      const storagePool = await api.call({ abi: 'address:storagePool', target: troveManager })
      const tokens = await api.call({ abi: 'address[]:getCollTokenAddresses', target: tokenManager })
      const debtTokens = await api.call({ abi: 'address[]:getDebtTokenAddresses', target: tokenManager })
      const blacklistedTokens = debtTokens.concat([ // exclude minted tokens whose backing is already counted towards tvl
        '0x5b8203e65aa5be3f1cf53fd7fa21b91ba4038ecc', // APO - projects own token +  more locked here than mcap on cg + very low liquidity
      ])

      const pairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: swapOperations })
      const tokens0 = await api.multiCall({ abi: 'address:token0', calls: pairs })
      const tokens1 = await api.multiCall({ abi: 'address:token1', calls: pairs })
      await api.sumTokens({ tokensAndOwners2: [tokens0.concat(tokens1), pairs.concat(pairs)], blacklistedTokens })

      return api.sumTokens({ owner: storagePool, tokens, blacklistedTokens })
    }
  }
})


module.exports.methodology = 'Value of tokens backing the minted synth tokens, project related tokens are excluded from the tvl'