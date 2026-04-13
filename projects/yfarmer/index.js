const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

module.exports = {
  base: {
    tvl: async (api) => {
      const totalAssets = await api.call({
        target: "0x71c298a6eb10e7958ce25a450a706330a4c946c0",
        abi: "function totalAssets() view returns (uint256)",
      })

      api.add(USDC, totalAssets)
    },
  },
}
