const { tvl, borrowed } = require("./helper/index");

module.exports = {
  hallmarks: [],
  methodology: `TVL includes ERC-20 and ERC-721 tokens that have been supplied as well as ERC-20 tokens that are supplied for lending.`,
  ethereum: {
    tvl,
    borrowed,
  },
};
