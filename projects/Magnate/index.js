const { compoundExports2 } = require("../helper/compound");

module.exports = {
  base: compoundExports2({
    comptroller: "0x9C1925d9fA1E9ba7aa57db36B15E29C07f5d85e2",
    fetchBalances: true,
    cether: '0x68725461357B7e5e059A224B3b2fC45F3654c889',
  }),
};
