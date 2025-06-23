const COLLATERAL_PER_TOKEN = 0.10;  // ETH por fragmento
const CONTRACT             = '0xb933f98b5e622463e3f5f25a75cdc2992d0a2ae'; // mainnet

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const minted = await api.call({
        target: CONTRACT,
        abi: 'uint256:tokenIds',
      });

      return {
        ethereum: Number(minted) * COLLATERAL_PER_TOKEN
      };
    },
  },
};
