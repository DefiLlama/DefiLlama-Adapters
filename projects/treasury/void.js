const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xf0a793024Ac47e421EB8c4673212dfCcE42f4a97";
const tokenReflectionsAwardAddress = "0x78cCb45a43731cf989C740e9cb31f3d192Bd0f8b"

module.exports = treasuryExports({
  fantom: {
    owners: [treasury, tokenReflectionsAwardAddress],
    ownTokens: [
      "0x80F2B8CdbC470c4DB4452Cc7e4a62F5277Db7061", // VOID
    ],
    tokens: [
      nullAddress,
      ADDRESSES.fantom.DAI, // DAI
      "0xfC66Ac63D414d3CF3dcdDa9e60742F6E789205e3", // SpookySwap VOID-DAI LP
    ],
  },
});