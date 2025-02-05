const USTB = "0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e";

module.exports = {
  methodology: "TVL corresponds to the total amount of USTB & USCC minted onchain, does not include Superstate book-entry AUM",
  ethereum: {
    tvl: async (api) => {
      const totalSupplies = await api.multiCall({
        calls: [USTB],
        abi: "erc20:totalSupply",
      });
      api.addTokens([USTB], totalSupplies);
    },
  },
};
