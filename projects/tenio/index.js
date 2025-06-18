const COLLATERAL_PER_TOKEN = 0.10;           // ETH por fragmento
const CONTRACT = '0x75DA787FDA32092079dbe113c5c9DBC22CBBC455';

module.exports = {
  ethereum: {
    tvl: async (api) => {
      // tokenIds() -> uint256 (total fragmentos)
      const minted = await api.call({
        target: CONTRACT,
        abi: 'uint256:tokenIds',
      });
      return {
        ethereum: minted.toNumber() * COLLATERAL_PER_TOKEN,
      };
    },
  },
};
