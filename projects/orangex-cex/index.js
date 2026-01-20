const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.orangex
  },
  ethereum: {
    owners: [
      "0xaefac73a5109c17f5c8ce3fefa58df605561fdcb",
      "0xfe2967c2957dc00d46563b01591c9a5c8db08394",
      "0xaefac73a5109c17f5c8ce3fefa58df605561fdcb",
      "0xfe2967c2957dc00d46563b01591c9a5c8db08394",
    ],
  },
};

module.exports = cexExports(config);