const COLLATERAL_PER_TOKEN = 0.10;   // ETH por fragmento
const CONTRACT = '0xB933F98B5E622463E3F35F25A75CdC2992d0A2ae';  // dirección del contrato

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
