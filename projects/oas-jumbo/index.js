const { default: BigNumber } = require("bignumber.js");

const CONTRACT_ADDRESSES = {
  environmentContract: "0x0000000000000000000000000000000000001000", // Environment contract address
  stakesManagerContract: "0x0000000000000000000000000000000000001001", // Stakes manager contract address
  oasJumboStaking: "0x7e6347ddC55dF19B94C9FE893bf551CFc8C2208b", // OAS Jumbo staking contract address
};

const contractAbis = {
  getStakerStakes: {
    abi: "function getStakerStakes(address staker, uint256 epoch, uint256 cursor,uint256 howMany) returns (address[] memory validators, uint256[] memory oasStakes, uint256[] memory woasStakes, uint256[] memory soasStakes, uint256 newCursor)",
  },
  epoch: {
    abi: "function epoch() external view returns (uint256)",
  },
};

module.exports = {
  oas: {
    tvl: async (api) => {
      try {
        // Fetch current epoch
        const epoch = await api.call({
          abi: contractAbis.epoch.abi,
          target: CONTRACT_ADDRESSES.environmentContract,
        });

        // Fetch staker stakes
        const { oasStakes } = await api.call({
          abi: contractAbis.getStakerStakes.abi,
          target: CONTRACT_ADDRESSES.stakesManagerContract,
          params: [CONTRACT_ADDRESSES.oasJumboStaking, epoch, 12, 1],
        });

        // Convert stake value using BigNumber and return
        const oasysStake = new BigNumber(oasStakes[0]).div(1e18).toString();
        
        return {
          oasys: oasysStake,
        };
      } catch (error) {
        console.error("Error fetching TVL:", error);
        return {
          oasys: "0", // Fallback value
        };
      }
    },
  },
};
