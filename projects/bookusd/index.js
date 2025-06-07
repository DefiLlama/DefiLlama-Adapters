const { staking } = require("../helper/staking.js");
const { getLiquityTvl } = require("../helper/liquity.js");

// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0xFe5D0aBb0C4Addbb57186133b6FDb7E1FAD1aC15";
const STAKING_ADDRESS = "0xD8eC53945788C2bC8990828a46fb2f408D8C3a17";
const BUSS_ADDRESS = "0xfC35Bf79270bCad22Ce7dd5651Aa2435fce9b7C5"
const BOOK_ADDRESS = "0xC9Ad421f96579AcE066eC188a7Bba472fB83017F"


module.exports = {
  start: '2025-04-26',
  bsc: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS, {
      // abis: {
      //   collateralToken: "address:collateralToken",
      // },
      collateralToken: BOOK_ADDRESS,
      nonNativeCollateralToken: true,
    }),
  }
}