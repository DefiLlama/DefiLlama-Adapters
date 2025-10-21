const { staking } = require("../helper/staking");

const LIFT_TOKEN_CONTRACT = "0x513C3200F227ebB62e3B3d00B7a83779643a71CF";
const LIFT_STAKING_CONTRACT = "0x49C5b5f3aba18A4bCcF57AA1567ac5Bd46e82381";

module.exports = {
      methodology: "Counts the number of LIFT tokens in the Staking contract",
  start: '2021-11-18',
  bsc: {
    tvl: () => ({}),
    staking: staking(LIFT_STAKING_CONTRACT, LIFT_TOKEN_CONTRACT),
  }
};
