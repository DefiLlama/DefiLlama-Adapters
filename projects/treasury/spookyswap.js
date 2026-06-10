const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const multisig = "0x1A11f5DF739bEca4974aCE4d8E5CE5ef5D854889";

module.exports = treasuryExports({
  fantom: {
    tokens: [
      nullAddress,
      "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", // DAI
      "0x74b23882a30290451A17c44f4F05243b6b58C76d", // ETH
      "0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e", // BEETS
      ADDRESSES.fantom.WFTM, // WFTM
      "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
    ],
    owners: [multisig],
    ownTokens: ["0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE"],
  },
});
