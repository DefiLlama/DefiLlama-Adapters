const config = {
  arbitrum: {
    factory: "0xB4Ca72eA4d072C779254269FD56093D3ADf603b8",
    getTokensAbi: "function getDShares() external view returns (address[] memory, address[] memory)",
    usdplus: "0xfc90518D5136585ba45e34ED5E1D108BD3950CFa"
  },
  ethereum: {
    factory: "0x60B5E7eEcb2AEE0382db86491b8cFfA39347c747",
    getTokensAbi: "function getDShares() external view returns (address[] memory, address[] memory)",
    usdplus: "0x98C6616F1CC0D3E938A16200830DD55663dd7DD3"
  },
  blast: {
    factory: "0x6Aa1BDa7e764BC62589E64F371A4022B80B3c72a",
    getTokensAbi: "function getDShares() external view returns (address[] memory, address[] memory)"
  }
}

async function getTokens(api, chain) {
  return (await api.call({
    chain: chain,
    target: config[chain].factory,
    abi: config[chain].getTokensAbi
  }))[0];
}

Object.keys(config).forEach( chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      // get dShare tokens
      const tokens = await getTokens(api, chain)
      const bals = await api.multiCall({ chain: chain, abi: 'erc20:totalSupply', calls: tokens})
      // add USD+
      const usdplus = config[chain].usdplus
      if (usdplus) {
        const usdplusBal = await api.call({chain: chain, target: usdplus, abi: 'erc20:totalSupply'})
        tokens.push(usdplus)
        bals.push(usdplusBal)
      }
      api.add(tokens, bals)
    }
  }
})
