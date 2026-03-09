const config = {
  ethereum: "0x6a5D488EC17d6a7a1872AaB88feC90c1B2Df4196",
  scroll: "0xea3E87699D11B77Fba754Bf0257a25664B97437d",
  bsc: "0x6a5D488EC17d6a7a1872AaB88feC90c1B2Df4196",
};

const stakingConfig = {
  bsc: "0xb080B94052f039eC2CA8BBaF7Ec13329d1926973",     // BSC staking contract
  fhe: "0xdeD96288c99145da4800f55355A2466f6238fBBE", // MindChain staking contract
};
const FHE = "0xd55C9fB62E176a8Eb6968f32958FeFDD0962727E"; // FHE token address

module.exports = {
  methodology: "Counts the total amount of asset tokens deposited in each of the Strategy contracts registered in the helper contract on each chain. Staking counts the total amount of FHE tokens deposited in Mind Agentic World contracts on BSC and MindChain.",
};

Object.keys(config).forEach(chain => {
  const target = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const [_vaults, tokens, bals] = await api.call({
        abi: "function getPoolTotalAssets() view returns (address[] memory,address[] memory, uint256[] memory)",
        target,
      })
      api.add(tokens, bals)
    }
  }
})

Object.entries(stakingConfig).forEach(([chain, stakingContract]) => {
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
