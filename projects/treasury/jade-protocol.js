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
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // wbtc
        '0xac3E018457B222d93114458476f3E3416Abbe38F', // sfrxETH
        '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', // FXS
     ],
    owners: [treasury, treasury1],
  },
  bsc: {
    tokens: [
      nullAddress,
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',//busd
    ],
  owners: [treasuryBSC],
},
avax: {
  tokens: [
     nullAddress,
     '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',//usdc
  ],
  owners: [treasuryAVAX]
},
optimism: {
  tokens: [
    nullAddress,
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', //usdc
  ],
  owners: [treasuryOP]
},
arbitrum: {
  tokens: [
    nullAddress,
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', //usdc
    '0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017', //rdnt
    '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',//gmx
  ],
  owners: [treasuryARB, treasuryARB2]
}
})