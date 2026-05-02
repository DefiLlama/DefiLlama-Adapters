const { sumTokens2 } = require("../helper/solana");

module.exports = {
  solana: {
    tvl: () =>
      sumTokens2({ owner: "CTDLvGGXnoxvqLyTpGzdGLg9pD6JexKxKXSV8tqqo8bN" }),
  },
};
