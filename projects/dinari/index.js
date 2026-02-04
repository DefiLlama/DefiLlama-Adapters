const config = {
  arbitrum: {
    factory: "0xB4Ca72eA4d072C779254269FD56093D3ADf603b8",
    usdplus: "0xfc90518D5136585ba45e34ED5E1D108BD3950CFa"
  },
  ethereum: {
    factory: "0x60B5E7eEcb2AEE0382db86491b8cFfA39347c747",
    usdplus: "0x98C6616F1CC0D3E938A16200830DD55663dd7DD3"
  },
  blast: {
    factory: "0x6Aa1BDa7e764BC62589E64F371A4022B80B3c72a",
  },
  kinto: {
    factory: "0xE4Daa69e99F48AD0C4D4843deF4447253248A906",
    usdplus: "0x6F086dB0f6A621a915bC90295175065c9e5d9b8c"
  },
  base: {
    factory: "0xBCE6410A175a1C9B1a25D38d7e1A900F8393BC4D",
    usdplus: "0x98C6616F1CC0D3E938A16200830DD55663dd7DD3"
  },
  plume: {
    // factory: "0x84ad0De589B0075E057123c800959f10C29869D8"
  },
  plume_mainnet: {
    factory: "0x7a861Ae8C708DC6171006C57c9163BD2BB57a8Aa",
    usdplus: "0x1fA3671dF7300DF728858B88c7216708f22dA3Fb"
  }
}

const abi = "function getDShares() external view returns (address[] memory, address[] memory)"

const tvl = async (api) => {
  const { factory, usdplus } = config[api.chain]
  if (usdplus) api.add(usdplus, await api.call({ target: usdplus, abi: 'erc20:totalSupply'}))
  if (!factory) return
  const [tokens] = await api.call({ target: factory, abi })
  const balances = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })
  api.add(tokens, balances)
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})