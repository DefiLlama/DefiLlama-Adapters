module.exports = {
  sonic: {
    tvl: async (api) => {
      const wstkscUSD = '0x9fb76f7ce5fceaa2c42887ff441d46095e494206';       // wstkscUSD token
      const vault = '0xb27f555175e67783ba16f11de3168f87693e3c8f';            // Vault holding wstkscUSD
      const scUSD = '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE';          // scUSD token for pricing

      // Fetch wstkscUSD balance of vault
      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: wstkscUSD,
        params: vault,
      });

      // Fetch price (shares per 1e6 units)
      const price = await api.call({
        abi: 'function convertToShares(uint256) view returns (uint256)',
        target: wstkscUSD,
        params: ['1000000'],  // 1 * 10^6 (assumes 6 decimals)
      });

      // Both balance and price are BigNumbers, so use BigInt for precision
      // Calculate adjusted balance in scUSD units:
      // adjustedBalance = balance * 1e6 / price
      // Use BigInt arithmetic to avoid floating point issues

      const balanceBigInt = BigInt(balance.toString());
      const priceBigInt = BigInt(price.toString());
      const oneMillion = BigInt(1_000_000);

      const adjustedBalance = balanceBigInt * oneMillion / priceBigInt;

      // Add TVL in scUSD units (which DefiLlama knows price for)
      api.add(scUSD, Number(adjustedBalance));
    },
  },
};
