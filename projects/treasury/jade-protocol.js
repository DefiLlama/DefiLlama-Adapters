const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x6f0bc6217faa5a2f503c057ee6964b756a09ae2c";
const treasury1 = "0xcb0718b150552af8904e7cb1c62758dcb149b072";

const treasuryBSC = "0x169169a50d9a8fbf99edacf9aa10297e2b3c92dd";

const treasuryAVAX = "0xaeA6B4AAd5e315a40aFD77a1F794F61161499Fa5";

const treasuryOP = "0x489f866c0698C8D6879f5C0F527bc8281046042D";
const treasuryARB = "0x02944e3fb72aa13095d7cebd8389fc74bec8e48e";
const treasuryARB2 = "0xd012A9C8159b0E7325448eD30B1499FddDAc0F40";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.sfrxETH,
        '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', // FXS
     ],
    owners: [treasury, treasury1],
  },
  bsc: {
    tokens: [
      nullAddress,
      ADDRESSES.bsc.BUSD,
    ],
  owners: [treasuryBSC],
},
avax: {
  tokens: [
     nullAddress,
     ADDRESSES.avax.USDC,
  ],
  owners: [treasuryAVAX]
},
optimism: {
  tokens: [
    nullAddress,
    ADDRESSES.optimism.USDC,
  ],
  owners: [treasuryOP]
},
arbitrum: {
  tokens: [
    nullAddress,
    ADDRESSES.arbitrum.USDC,
    '0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017', //rdnt
    ADDRESSES.arbitrum.GMX,
  ],
  owners: [treasuryARB, treasuryARB2]
}
})