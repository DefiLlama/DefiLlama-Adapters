const USTB = "0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e";
const USCC = "0x14d60e7fdc0d71d8611742720e4c50e7a974020c";

module.exports = {
  methodology: "TVL corresponds to the total amount of USTB & USCC minted",
  ethereum: {
    tvl: async (api) => {
      const totalSupplies = await api.multiCall({
        calls: [USTB, USCC],
        abi: "erc20:totalSupply",
      });
      api.addTokens([USTB, USCC], totalSupplies);
    },
  },
};
