const { staking } = require("../helper/staking");

const ROCK = "0x826628622a8B55F4AF6aC2A1DD1273bF837e651a";
const stakingContract = "0xFDfd4A3CfECD29E00942ee3E01cDa6f92E9270BA";

module.exports = {
  deadFrom: '2025-11-04',
  bitrock: { tvl: staking(stakingContract, ROCK, "bitrock") },
  methodology: "ROCK tokens locked in staking contract",
};