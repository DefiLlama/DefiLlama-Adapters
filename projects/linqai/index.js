const stakingPools = [
    "0x786d0536B63f3638bcD17897A98B066D901C27b8",
    "0xCB5Dc61Cc672761Ec049dd9349745b418580BC83",
  ];
  
  const rewardToken = "0xD4F4D0a10BcaE123bB6655E8Fe93a30d01eEbD04"; // LNQ
  
  module.exports = {
    ethereum: {
      tvl: async () => ({}),
      staking: async (api) => {
        const stakingData = stakingPools.map((poolAddress) => [rewardToken, poolAddress]);
        return api.sumTokens({
          tokensAndOwners: stakingData,
        });
      },
    },
  };
  