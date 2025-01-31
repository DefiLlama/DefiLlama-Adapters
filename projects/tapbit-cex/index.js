const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: ["0x33b9b598fb490f17426da7b7d344ead1bc3915dd"],
  },
  bitcoin: {
    owners: bitcoinAddressBook.tapbit,
  },
};

module.exports = cexExports(config);
