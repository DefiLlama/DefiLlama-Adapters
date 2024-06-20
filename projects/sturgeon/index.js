const { ethers} = require("ethers");
const abi = {
  "allVaults": "function allVaults(address user, address priceToken) external view returns (address[] memory vaults, address[] memory compounders, address[] memory underlyings, string[6][] memory strings, address[] memory strategies, uint[3][] memory nums, uint[2][] memory balances, uint[3][] memory gaugeLeft)"
}

const config = {
  "real": {
    frontend: "0x045c8a060474874c5918717ecd55f07b62c59a90",
    priceToken: "0x83feDBc0B85c6e29B589aA6BdefB1Cc581935ECD",
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      const allVaultsData = await api.call({
        abi: abi.allVaults,
        target: config[chain].frontend,
        params: ['0x0000000000000000000000000000000000000000', config[chain].priceToken,],
      });
      allVaultsData.nums.forEach(num => {
        const totalAssets = num[0]
        const decimals = num[1]
        const sharePrice = num[2]
        const tvl = totalAssets * sharePrice / ethers.parseUnits('1', +decimals).toString()
        api.add(config[chain].priceToken, tvl)
      })
    },
  }
})
