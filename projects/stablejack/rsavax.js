const { sumTokensExport } = require("../helper/unwrapLPs"); // Import utility functions
const RSAVAX_TOKEN_ADDRESS = "0xDf788AD40181894dA035B827cDF55C523bf52F67"; // rsAVAX token address
const TRACKED_CONTRACT_ADDRESS = "0xf010696e0BE614511516bE0DdB89AFf06B6cA440"; // Contract to track

module.exports = {
  avalanche: {
    tvl: async (api) => {
      const rsAVAXBalance = await api.call({
        abi: "erc20:balanceOf", // ABI to get token balance
        target: RSAVAX_TOKEN_ADDRESS, // Token address
        params: TRACKED_CONTRACT_ADDRESS, // Contract address to track
      });

      api.add(RSAVAX_TOKEN_ADDRESS, rsAVAXBalance); // Add balance to TVL
    }
  }
};
