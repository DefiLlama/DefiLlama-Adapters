const COLLATERAL_PER_TOKEN = 0.10;   // ETH por fragmento
const CONTRACT = '0xb933f98b5e622463e3f5f25a75cdc2992d0a2ae';  // dirección del contrato

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const minted = await api.call({
        target: CONTRACT,
        abi: 'uint256:tokenIds',   // cambia si el nombre es distinto
      });
      return {
        ethereum: minted.toNumber() * COLLATERAL_PER_TOKEN,
      };
    },
  },
};
