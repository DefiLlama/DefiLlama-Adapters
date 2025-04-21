const config = {
  bsc: "0xb080B94052f039eC2CA8BBaF7Ec13329d1926973",     // BSC staking contract
  fhe: "0xdeD96288c99145da4800f55355A2466f6238fBBE", // MindChain staking contract
};

const FHE = "0xd55C9fB62E176a8Eb6968f32958FeFDD0962727E"; // FHE token address

module.exports = {
  methodology: "Counts the total amount of FHE tokens deposited in Mind Agentic World contracts on BSC and MindChain.",
};

Object.entries(config).forEach(([chain, stakingContract]) => {
  module.exports[chain] = {
    tvl: async () => ({}), // No external TVL for now
    staking: async (api) => {
      const balance = await api.call({
        abi: "erc20:balanceOf",
        target: FHE,
        params: [stakingContract],
      });

      const bigIntAmount = BigInt(balance); 
      const amountInToken = bigIntAmount / BigInt(10 ** 18); 

      api.addCGToken("mind-network", amountInToken);
    },
  };
});
