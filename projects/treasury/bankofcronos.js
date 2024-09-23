const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const teamTreasury = "0xBacF28BF21B374459C738289559EF89978D08102";

const BOC = "0xe5786DDFc4D6DcA0973D1c5b02987cBbac66ed87";
const pBOC = "0xF93fB4CDB0e40dbF33d2cDbf11D9516f6aDd7e8e";

module.exports = treasuryExports({
  cronos: {
    tokens: [
        nullAddress,
        ADDRESSES.cronos.USDC,//USDC
        '0x26043Aaa4D982BeEd7750e2D424547F5D76951d4',//CUSD
        ADDRESSES.cronos.WCRO_1,//WCRO
        '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a',//WETH
        ADDRESSES.cronos.WBTC,//WBTC
     ],
    owners: [teamTreasury],
    // ownTokens: [BOC, pBOC],
  },
})
