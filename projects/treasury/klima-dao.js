const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const klimaTreasury1 = "0x7dd4f0b986f032a44f913bf92c9e8b7c17d77ad7";

const KLIMA = "0x4e78011ce80ee02d2c3e649fb657e45898257815";


module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
        '0x2F800Db0fdb5223b3C3f354886d907A671414A7F', // BCT
        ADDRESSES.polygon.USDC, // USDC
        '0xD838290e877E0188a4A44700463419ED96c16107', // NCT
        '0xAa7DbD1598251f856C12f63557A4C4397c253Cea', // MCO2
        '0x2B3eCb0991AF0498ECE9135bcD04013d7993110c', // UBO
        '0x6BCa3B77C1909Ce1a4Ba1A20d1103bDe8d222E48', // NBO
        '0x5786b267d35F9D011c4750e0B0bA584E1fDbeAD1', // USDC/KLIMA SLP
        '0x9803c7aE526049210a1725F7487AF26fE2c24614', // BCT/KLIMA SLP
        '0xb2D0D5C86d933b0aceFE9B95bEC160d514d152E1', // NCT/KLIMA SLP
        '0x64a3b8cA5A7e406A78e660AE10c7563D9153a739', // MCO2/KLIMA Quickswap LP
        '0x5400A05B8B45EaF9105315B4F2e31F806AB706dE', // UBO/KLIMA SLP
        '0x251cA6A70cbd93Ccd7039B6b708D4cb9683c266C', // NBO/KLIMA SLP
     ],
    owners: [klimaTreasury1],
    ownTokens: [KLIMA],
  },
})
