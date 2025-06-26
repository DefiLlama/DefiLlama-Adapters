const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const beradromeTreasury = "0xaB53AfB5C63E2552e7bD986c0a38E8a8dC58E09C";
const oBERO = "0x40A8d9efE6A2C6C9D193Cc0A4476767748E68133";
const hiBERO = "0x7F0976b52F6c1ddcD4d6f639537C97DE22fa2b69"


module.exports = treasuryExports({
  berachain: {
    tokens: [
        nullAddress,
        "0x5C43a5fEf2b056934478373A53d1cb08030fd382", //BRLY
        ADDRESSES.berachain.HONEY, //HONEY
        "0x18878Df23e2a36f81e820e4b47b4A40576D3159C", // OHM
        "0x231A6BD8eB88Cfa42776B7Ac575CeCAf82bf1E21", //PLUG
    ],
    owners: [beradromeTreasury],
    ownTokens: [oBERO, hiBERO],
  },
});