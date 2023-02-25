const {  nullAddress,treasuryExports } = require("../helper/treasury");

const teamTreasury = "0x1087234fe877721F30016ebeD5BEd061397C8851";

const BOC = "0xe5786DDFc4D6DcA0973D1c5b02987cBbac66ed87";
const pBOC = "0xF93fB4CDB0e40dbF33d2cDbf11D9516f6aDd7e8e";

module.exports = treasuryExports({
  cronos: {
    tokens: [
        nullAddress,
        '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',//USDC
        '0x26043Aaa4D982BeEd7750e2D424547F5D76951d4',//CUSD
        '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',//WCRO
        '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a',//WETH
        '0x062E66477Faf219F25D27dCED647BF57C3107d52',//WBTC
     ],
    owners: [teamTreasury],
    ownTokens: [BOC, pBOC],
  },
})
