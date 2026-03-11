const { staking } = require("../helper/staking.js");
const { getLiquityTvl } = require("../helper/liquity.js");

// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";
const STAKING_ADDRESS = "0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d";
const LQTY_ADDRESS = "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D"

module.exports = {
  start: '2021-04-05',
  ethereum: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS),
    staking: staking(STAKING_ADDRESS, LQTY_ADDRESS)
  }
}