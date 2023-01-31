const { sumTokens } = require("../helper/sumTokens");
const config = require("./config");

const MOS_CONTRACT = "0x630105189c7114667a7179aa57f07647a5f42b7f";

module.exports = {};

Object.keys(config).forEach(chain => {
  let { tokens } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _1, _2, { chain }) => {
      const toa = [];
      Object.values(tokens).forEach((t) => {
        if (t) {
          toa.push([t, MOS_CONTRACT]);
        }
      });
      return sumTokens({ chain, tokensAndOwners: toa });
    }
  };
});
