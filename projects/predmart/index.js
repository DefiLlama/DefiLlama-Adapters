module.exports = {
    base: {
      tvl: async (api) => {
        await api.sumTokens({
          owners: ["0x0a7EFC7161fAa3DFA597481C62bb7B232AAB2Fa0"],
          tokens: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
        });
      },
    },
  };
