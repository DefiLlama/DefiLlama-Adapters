const { treasuryExports, nullAddress } = require("../helper/treasury");

const multisig = "0xD858eBAa943b4C2fb06BA0Ba8920A132fd2410eE";
const multisig2 = "0x799d4C5E577cF80221A076064a2054430D2af5cD";

module.exports = treasuryExports({
  avax: {
    tokens: [nullAddress, "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"],
    owners: [multisig, multisig2],
    ownTokens: ["0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd"],
  },
});
