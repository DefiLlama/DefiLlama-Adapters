const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL includes wstkscUSD tokens held in the vault, mapped to scUSD using convertToAssets() for accurate pricing.",
  sonic: {
    tvl: async (api) => {
      const wstkscUSD = '0x9fb76f7ce5fceaa2c42887ff441d46095e494206';
      const scUSD = '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE';
      const vault = '0xb27f555175e67783ba16f11de3168f87693e3c8f';

      // Step 1: Get wstkscUSD balance in the vault
      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: wstkscUSD,
        params: vault,
      });

      // Step 2: Convert wstkscUSD balance to scUSD equivalent
      const valueInScUSD = await api.call({
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        target: wstkscUSD,
        params: balance,
      });

      // Step 3: Add to TVL as scUSD
      api.add(scUSD, valueInScUSD);
    },
  },
};
