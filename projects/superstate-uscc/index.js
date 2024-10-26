const USCC = "0x14d60e7fdc0d71d8611742720e4c50e7a974020c";

module.exports = {
  methodology: "TVL corresponds to the total amount of USCC minted onchain, does not include Superstate book-entry AUM",
  ethereum: {
    tvl: async (api) => {
      const totalSupplies = await api.multiCall({
        calls: [USCC],
        abi: "erc20:totalSupply",
      });
      api.addTokens([USCC], totalSupplies);
    },
  },
};
