const {  nullAddress,treasuryExports } = require("../helper/treasury");

const ohmTreasury = "0xBacF28BF21B374459C738289559EF89978D08102";

const OHM = "0xe5786DDFc4D6DcA0973D1c5b02987cBbac66ed87";


module.exports = treasuryExports({
  ethereum: {
    tokens: [
        nullAddress,
        '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',//USDC
        '0x26043Aaa4D982BeEd7750e2D424547F5D76951d4',//CUSD
        '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',//WCRO
        '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a',//WETH
        '0x062E66477Faf219F25D27dCED647BF57C3107d52',//WBTC
     ],
    owners: [ohmTreasury],
    ownTokenOwners: [ohmTreasury],
    ownTokens: [OHM],
  },
})
