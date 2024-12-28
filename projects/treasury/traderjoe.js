const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const multisig = "0xD858eBAa943b4C2fb06BA0Ba8920A132fd2410eE";
const multisig2 = "0x799d4C5E577cF80221A076064a2054430D2af5cD";
const multisig3 = "0x8F38558188FAe593E8E6347F124351CF4fDd032D"

module.exports = treasuryExports({
  avax: {
    tokens: [nullAddress, ADDRESSES.avax.USDC],
    owners: [multisig, multisig2, multisig3],
    ownTokens: [ADDRESSES.avax.JOE],
  },
});
