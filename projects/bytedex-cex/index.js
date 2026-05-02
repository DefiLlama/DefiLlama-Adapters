const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: [
      "0x7fcb38e8a9aeb1e735b2468873561f22e5eb1f53",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.bytedex,
  },
};

module.exports = cexExports(config);