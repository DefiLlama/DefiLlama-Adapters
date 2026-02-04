const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const perpProtocolTreasury = "0xD374225abB84DCA94e121F0B8A06B93E39aD7a99";
const PERP = "0xbC396689893D065F41bc2C6EcbeE5e0085233447";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.FXS,//FXS
        '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',//DHT
        '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F',//SDT
        '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',//DPI
        ADDRESSES.ethereum.USDC,//USDC
        '0xE0e05c43c097B0982Db6c9d626c4eb9e95C3b9ce',//USF
        ADDRESSES.ethereum.DAI,//DAI
        '0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a' //ARMOR
     ],
    owners: [perpProtocolTreasury],
    ownTokens: [PERP],
  },
})
