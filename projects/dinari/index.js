const config = {
  arbitrum: {
    factory: "0xB4Ca72eA4d072C779254269FD56093D3ADf603b8",
    getTokensAbi: "function getDShares() external view returns (address[] memory, address[] memory)",
    processor: "0xFA922457873F750244D93679df0d810881E4131D",
    latestPriceAbi: "function latestFillPrice(address assetToken, address paymentToken) view returns (tuple(uint256 price, uint64 blocktime))",
    usdplus: "0xfc90518D5136585ba45e34ED5E1D108BD3950CFa"
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
      const tokens = await getTokens(api, chain)
      const bals = await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens})
      api.add(tokens, bals)
    }
  }
})
