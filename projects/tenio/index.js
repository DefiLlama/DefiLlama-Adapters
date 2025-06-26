const COLLATERAL_PER_TOKEN = 0.10;  // ETH por fragmento
const CONTRACT = '0xF0076BFF99424EAC54271E278A73AB60A9f47dF1';  // dirección checksum final

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const minted = await api.call({
        target: CONTRACT,
        abi: 'uint256:tokenIds',
      });

      return {
        ethereum: Number(minted) * COLLATERAL_PER_TOKEN,
      };
    },
  },
};
