const { compoundExports2 } = require("../helper/compound");

module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  neon_evm: compoundExports2({
    comptroller: "0x252dBa92827744e6d2b01f1c9D77dcD3CBAb4573",
    cether: "0x3A81c854dCF6172cE3a7fFF024ECF20d8Ac2A1af",
  }),
};
