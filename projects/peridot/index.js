const { compoundExports2 } = require("../helper/compound");

module.exports = {
  methodology:
    "TVL is calculated by summing the underlying token balances of all markets in the Peridot lending protocol. Borrowed balances are also tracked separately.",
  bsc: compoundExports2({ comptroller: '0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14' }),
  monad: compoundExports2({ comptroller: '0x6D208789f0a978aF789A3C8Ba515749598940716', blacklistedMarkets: ['0xf8255935e62aa000c89de46a97d2f00bfff147e7'], cether: '0x2FB2861402A22244464435773dd1C6951735CdF7' }),
};