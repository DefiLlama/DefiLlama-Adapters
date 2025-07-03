module.exports = {
  sonic: {
    tvl: async (api) => {
      const wstkscUSD = '0x9fb76f7ce5fceaa2c42887ff441d46095e494206';       // wstkscUSD token address
      const vault = '0xb27f555175e67783ba16f11de3168f87693e3c8f';            // Vault holding wstkscUSD tokens
      const scUSD = '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE';          // scUSD token address (for pricing)

      // Get wstkscUSD balance of vault
      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: wstkscUSD,
        params: vault,
      });

      // Call convertToShares(1e6) to get price (shares per unit)
      const price = await api.call({
        abi: 'function convertToShares(uint256) view returns (uint256)',
        target: wstkscUSD,
        params: ['1000000'],  // 1 * 10^6, assuming 6 decimals
      });

      // Calculate adjusted balance in scUSD units:
      // Since price = shares per unit, real balance in scUSD = balance * 1e6 / price
      // Adjust for decimals accordingly (assuming 6 decimals)
      const adjustedBalance = balance * 1e6 / price;

      // Add TVL mapped to scUSD token
      api.add(scUSD, adjustedBalance);
    },
  },
};
