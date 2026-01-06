const { compoundExports } = require("../helper/compound");
const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  timetravel: true,
  methodology:
    "TVL is calculated by summing the underlying token balances of all markets in the Peridot lending protocol. Borrowed balances are also tracked separately.",
  bsc: compoundExports(
    "0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14", // Comptroller
    "0xD9fDF5E2c7a2e7916E7f10Da276D95d4daC5a3c3", // pWBNB (native market)
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // WBNB (underlying for native)
  ),
  monad: compoundExports(
    "0x6D208789f0a978aF789A3C8Ba515749598940716", // Comptroller
    "0x2FB2861402A22244464435773dd1C6951735CdF7", // pMON (native market)
    nullAddress, // Native token underlying (nullAddress = 0x0000...)
    { blacklistedTokens: ["0xf8255935e62aa000c89de46a97d2f00bfff147e7"] } // Blacklist market without underlying
  ),
};
