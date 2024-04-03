const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, } = require("../helper/treasury");

const OVR = {
  eth: "0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697",
  polygon: "0x1631244689EC1fEcbDD22fb5916E920dFC9b8D30",
};

const DAI = ADDRESSES.ethereum.DAI;
const IBCO = "0x8c19cF0135852BA688643F57d56Be72bB898c411";

module.exports = treasuryExports({
  ethereum: {
    owners: [IBCO],
    tokens: [DAI], 
    ownTokens: [OVR.eth]
  },
});
