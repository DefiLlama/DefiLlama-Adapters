const abi = {
  vaultParams: "function vaultParams() view returns (bool isPut, uint8 decimals, address asset, address underlying, uint56 minimumSupply, uint104 cap)"
}

const config = {
  ethereum: {
    vaults: [
      "0xAcD147A5bbCB7166c5BB13A9354ad7a59b99fB4d",  // weETH call vault
    ]
  }
}

module.exports = {
  methodology: "Sums the totalBalance of all 3Jane Theta Vaults",
};

Object.keys(config).forEach(chain => {
  const { vaults } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = await api.multiCall({ abi: "uint256:totalBalance", calls: vaults })
      const data = await api.multiCall({ abi: abi.vaultParams, calls: vaults })
      const tokens = data.map(d => d.asset)
      api.add(tokens, balances)
    }
  }
})
