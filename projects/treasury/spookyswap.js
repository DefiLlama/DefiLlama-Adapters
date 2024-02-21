const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const multisig = "0x1A11f5DF739bEca4974aCE4d8E5CE5ef5D854889";

module.exports = treasuryExports({
  fantom: {
    tokens: [
      nullAddress,
      ADDRESSES.fantom.DAI, // DAI
      "0x74b23882a30290451A17c44f4F05243b6b58C76d", // ETH
      "0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e", // BEETS
      ADDRESSES.fantom.WFTM, // WFTM
      ADDRESSES.fantom.USDC, // USDC
    ],
    owners: [multisig],
    ownTokens: ["0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE"],
  },
});
