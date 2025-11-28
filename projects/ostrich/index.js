module.exports = {
  methodology: "Assets secured by vault across networks.",
};
const config = {
  arbitrum: ["0xd5FAEb286E0AFe94e1537cE63622d75Da15d3F0d", "0x683e6C4B18Eda7a068a9ed104431715af67569cF"],
};

Object.keys(config).forEach((chain) => {
  let vault = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      if (!Array.isArray(vault)) vault = [vault];
      const tokens = await api.multiCall({
        abi: "address:wrappedToken",
        calls: vault,
      });
      return api.sumTokens({ tokensAndOwners2: [tokens, vault] });
    },
  };
});