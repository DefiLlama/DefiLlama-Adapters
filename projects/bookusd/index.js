const { staking } = require("../helper/staking.js");
const { getLiquityTvl } = require("../helper/liquity.js");

// TroveManager holds total system collateral (deposited BNB)
const TROVE_MANAGER_ADDRESS = "0xFe5D0aBb0C4Addbb57186133b6FDb7E1FAD1aC15";
const STAKING_ADDRESS = "0xD8eC53945788C2bC8990828a46fb2f408D8C3a17";
const BUSS_ADDRESS = "0xfC35Bf79270bCad22Ce7dd5651Aa2435fce9b7C5"; // BookUSD Share token

module.exports = {
  start: '2025-04-26',
  bsc: {
    // Calculate the total BNB collateral locked in the protocol
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS),
    // Tracks the amount of BUSS tokens currently staked by users.
    staking: staking(STAKING_ADDRESS, BUSS_ADDRESS),
  }
};
