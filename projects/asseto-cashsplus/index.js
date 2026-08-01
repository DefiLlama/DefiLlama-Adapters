module.exports = {
  methodology: "CASH+ is a 1:1 asset-backed token collateralized by the CMS USD Money Market Fund, which invests in high-quality short-term USD instruments.",
}

const config = {
  bsc: [
  "0x1775504c5873e179Ea2f8ABFcE3861EC74D159bc", // CashPlus_BSC
  ],
  ethereum: [
  "0x498D9329555471bF6073A5f2D047F746d522A373", // CashPlus_ETH
  ]
}

Object.keys(config).forEach(chain => {
  const tokens = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const supply  = await api.multiCall({  abi: 'uint256:totalSupply', calls: tokens})
      api.add(tokens, supply)
    }
  }
})