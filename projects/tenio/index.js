// TVL = tokenIds() * 0.10 ETH
const COLLATERAL_PER_TOKEN = 0.10;                           // ETH por fragmento
const CONTRACT = '0xb933f98b5e622463e3f5f25a75CdC2992d0A2ae'; // dirección del contrato

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const minted = await api.call({
        target: CONTRACT,
        abi: 'uint256:tokenIds',             // función del contrato
      });

      // api.call devuelve BigInt; lo convertimos a número JS
      return {
        ethereum: Number(minted) * COLLATERAL_PER_TOKEN,
      };
    },
  },
};
