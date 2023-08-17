const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const LidoTreasury = "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c";
const LDO = ADDRESSES.ethereum.LIDO;
const treasuryMatic = "0xd65Fa54F8DF43064dfd8dDF223A446fc638800A9"

const treasurySolana = "GQ3QPrB1RHPRr4Reen772WrMZkHcFM4DL5q44x1BBTFm"
const LDOsol = "HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.MATIC,//MATIC
        ADDRESSES.ethereum.USDC,//USDC
        '0x2eE543b8866F46cC3dC93224C6742a8911a59750',//MVDG
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',//HSF
        '0x232FB065D9d24c34708eeDbF03724f2e95ABE768',//SHEESHA
        '0x0d02755a5700414B26FF040e1dE35D337DF56218' //BEND
     ],
    owners: [LidoTreasury, treasuryMatic],
    ownTokens: [LDO],
  },
  solana: {
    tokens: [ 
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"
     ],
    owners: [treasurySolana],
    ownTokens: [LDOsol],
  },
})
