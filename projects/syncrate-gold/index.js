const SGLD = {
  base: "0x10C5E0643bCc6C915Cad0335f70A96c1532766eb",
};

module.exports = {
  methodology:
    "TVL represents the on-chain market capitalization of SGLD (total supply × price). Each SGLD is backed 1:1 by physical gold.",
  base: {
    tvl: async (api) => {
      const totalSupply = await api.call({
        target: SGLD.base,
        abi: "erc20:totalSupply",
      });
      api.add(SGLD.base, totalSupply);
    },
  },
};