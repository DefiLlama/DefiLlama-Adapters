const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  avax: {
    owners: [
      "0xb016ebc8a1440aff7bf098b8f165af65eb898738",
      "0xa108b99c315c22673f7f5b5ca172a21628cf8334",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.hashkeyExchange
  },
  ethereum: {
    owners: [
      "0x7ffbafdc1e4f0a4b97130b075fb4a25f807a1807", //cold
      "0xffe15ff598e719d29dfe5e1d60be1a5521a779ae",
      //     "0x7269bc4a66c755b951f068626201090f0c3098e9", // bosera funds https://www.bosera.com/english/index.html
      "0x48ee4a557e291c2a48d227e8a8dbe2217a825682",
    ],
  },
  litecoin: {
    owners: [
      "ltc1qh6w8epz4ycm2smpmnhfauqach28qr4ge6jffyv",
      "LSNjwQ1RGR5rbVDzCwrWiMQF8rdqVRGcPu",
    ],
  },
  polygon: {
    owners: [
      "0xecd094b51bafbd7bffdf1f4fef067c5d197a1b75",
      "0xee4f6df29617f00b12f85ee56c68962cbeac16aa",
    ],
  },
};

module.exports = cexExports(config);
