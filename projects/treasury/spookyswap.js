const { treasuryExports, nullAddress } = require("../helper/treasury");

const multisig = "0x1A11f5DF739bEca4974aCE4d8E5CE5ef5D854889";

module.exports = treasuryExports({
  fantom: {
    tokens: [
      nullAddress,
      "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", // DAI
      "0x74b23882a30290451A17c44f4F05243b6b58C76d", // ETH
      "0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e", // BEETS
      "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
      "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC
    ],
    owners: [multisig],
    ownTokens: ["0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE"],
  },
});
