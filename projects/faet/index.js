const STAKING_CONTRACT = "0xFbb61c8C8aA305F3ced88cA7D6E7859126Dc3B83";
const FAET_TOKEN = "0xdF92bA28D17329a7284A5eC230967768D4cb7A89";

module.exports = {
  methodology: "TVL includes FAET tokens staked in the FaetStaking contract.",
  start: 17400000,
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      return api.sumTokens({ tokens: [FAET_TOKEN], owners: [STAKING_CONTRACT] });
    },
  },
};
