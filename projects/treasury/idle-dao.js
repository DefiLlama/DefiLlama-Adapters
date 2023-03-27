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
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
        "0x4da27a545c0c5B758a6BA100e3a049001de870f5", //stkAAVE
        "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", //BNB
        "0xc00e94Cb662C3520282E6f5717214004A7f26888",//comp
        "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",//sUSD
        "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",//RAI
        "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",//sushi
        "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",//matic
        "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",//ldo
        "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",//alcx
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",//dai
        "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",//steth
        "0x514910771AF9Ca656af840dff83E8264EcF986CA",//link
     ],
    owners: [treasury, treasury1, treasury2, treasury3, treasury4, treasury5],
    ownTokens: [IDLE],
  },
  polygon: {
    tokens: [
        nullAddress,
        "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",//dquick
        "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",//dai
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",//wmatic
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",//weth
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",//usdc
        "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",//QI
    ],
    owners: [treasuryPolygon, treasuryPolygon1],
    ownTokens: [IDLEPolygon]
  }
})