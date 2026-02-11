
const configV2 = {
  base: {
    pweETH: '0xAeBCc0Ed30A8478D1A0d4b9773edB30f0211f713',
    pwstETH: '0x8a7944fD5a61698762D7daa0898b5EafCf4936Dc',
    pwETH: '0xa1Aba5518ffC0aA26F3812aC4777081CceFfAFe6',
    pwSPA: '0x6996145AdDddb2ef51119D71f29C61513d30e8B3',
  }
}

Object.keys(configV2).forEach(chain => {
  const pTokens = Object.values(configV2[chain])

  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:asset', calls: pTokens })
      return api.sumTokens({ tokensAndOwners2: [tokens, pTokens] })
    },
    borrowed: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:asset', calls: pTokens })
      const borrows = await api.multiCall({ abi: 'uint256:totalBorrows', calls: pTokens })
      api.add(tokens, borrows)
      return api.getBalances()
    }
  }
})
