const { gmxExports } = require("../helper/gmx");

const vault = "0x17D3FdF3b017C96782dE322A286c03106C75C62E";

module.exports = {
  telos: {
    tvl: gmxExports({ vault}),
  },
};