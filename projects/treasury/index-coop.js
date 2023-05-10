const { Indexed } = require("ethers/lib/utils");
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x9467cfADC9DE245010dF95Ec6a585A506A8ad5FC";
const treasury2 = "0x462a63d4405a6462b157341a78fd1babfd3f8065"
const treasury3 = "0xfafd604d1cc8b6b3b6cc859cf80fd902972371c1"

const INDEX = "0x0954906da0Bf32d5479e25f46056d22f08464cab";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x5aFE3855358E112B5647B952709E6165e1c1eEEe',//SAFE
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',
        '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
        '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643'
     ],
    owners: [treasury, treasury2, treasury3],
    ownTokens: [INDEX],
  },
})