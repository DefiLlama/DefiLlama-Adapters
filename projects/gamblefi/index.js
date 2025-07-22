const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const betifystaking = "0x335CAC92af7015BE7802170B62Ebc4C74900484d";
const betify = "0xD465b6B4937D768075414D413e981Af0b49349Cc";
const treasury = "0x596a6DFf0CF36fABf75EDeB6aA2992C950Ff14bA";
const dao = "0xEe376093ccDB3D81f226C2290868219687226845";
const revenueShare = "0x40822C8E1389dE62980691bF0AFBd5B8D1D56cB7";

async function tvl(api) {
  return api.sumTokens({ owners: [treasury, dao, revenueShare], tokens: [
    "0xf2001b145b43032aaf5ee2884e456ccd805f677d", 
    "0x76f0adfff61fd9a542a36a98b96909ec7d3a8c53", 
    "0xe2c5275d86D2fB860F19a2CbBED9967d39AA73e8", 
    ADDRESSES.cronos.WCRO_1,
    "0x3e7dfdd82965515e9b6398d91b991f5d4c830ef6",
  ] })
}
module.exports = {
  cronos: {
    tvl,
    staking: staking(betifystaking, betify),
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked BETIFY for staking",
};
