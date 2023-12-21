const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

//eth 
const treasury = "0xb0aA1f98523Ec15932dd5fAAC5d86e57115571C7";
const treasury1 = "0x107A369bc066c77FF061c7d2420618a6ce31B925";
const treasury2 = "0x69a62C24F16d4914a48919613e8eE330641Bcb94";
const treasury3 = "0xbecc659bfc6edca552fa1a67451cc6b38a0108e4";
const treasury4 = "0x076ff8e6402b02855ff82119b53e59bbdd67f0ee";
const treasury5 = "0xFb3bD022D5DAcF95eE28a6B07825D4Ff9C5b3814"

const IDLE = "0x875773784af8135ea0ef43b5a374aad105c5d39e";

// polygon

const treasuryPolygon = "0x1d60E17723f8Ca1F76F09126242AcD37a278b514"
const treasuryPolygon1 = "0x61A944Ca131Ab78B23c8449e0A2eF935981D5cF6"

const IDLEPolygon = "0xc25351811983818c9fe6d8c580531819c8ade90f"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        "0x4da27a545c0c5B758a6BA100e3a049001de870f5", //stkAAVE
        ADDRESSES.ethereum.BNB,
        "0xc00e94Cb662C3520282E6f5717214004A7f26888",//comp
        ADDRESSES.ethereum.sUSD,
        "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",//RAI
        ADDRESSES.ethereum.SUSHI,
        ADDRESSES.ethereum.MATIC,
        ADDRESSES.ethereum.LIDO,
        "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",//alcx
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.LINK,
     ],
    owners: [treasury, treasury1, treasury2, treasury3, treasury4, treasury5],
    ownTokens: [IDLE],
  },
  polygon: {
    tokens: [
        nullAddress,
        "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",//dquick
        ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.WMATIC_2,//wmatic
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.USDC,
        "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",//QI
    ],
    owners: [treasuryPolygon, treasuryPolygon1],
    ownTokens: [IDLEPolygon]
  }
})