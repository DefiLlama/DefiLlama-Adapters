const abi = {
  // The abi object contains the ABI for the vaultParams function, which provides data about the vault parameters.
  vaultParams: "function vaultParams() view returns (bool isPut, uint8 decimals, address asset, address underlying, uint56 minimumSupply, uint104 cap)"
}

const config = {
  // The config object contains the configuration for the 3Jane Theta Vaults on different chains.
  ethereum: {
    vaults: [
      "0xAcD147A5bbCB7166c5BB13A9354ad7a59b99fB4d",  // weETH call vault
    ]
  }
}

module.exports = {
  // The methodology property explains how the TVL is calculated.
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
