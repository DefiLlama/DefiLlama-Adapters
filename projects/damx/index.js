const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

//Fantom
const fantomVault = "0xD093eeE7c968CEef2df96cA9949eba1a1A9b2306";
const fantomStaking = "0xECef79f974182f4E9c168E751101F23686Bdc6dF";
const fantomDMX = "0x0Ec581b1f76EE71FB9FEefd058E0eCf90EBAb63E";

module.exports = {
  fantom: {
    staking: staking(fantomStaking, fantomDMX),
    tvl: gmxExports({ vault: fantomVault })
  }
};
