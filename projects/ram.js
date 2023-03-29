const {usdCompoundExports} = require("./helper/compound");

const controllerAddress = "0x0d4fe8832857Bb557d8CFCf3737cbFc8aE784106";

module.exports = {
  timetravel: true, // but we don't have a thundercore archive node atm
  thundercore: usdCompoundExports(controllerAddress, "thundercore", "0xeF5A0CE54a519B1Db3F350EB902C4cFbf7671D88", undefined, { cetheEquivalent: '0x413cEFeA29F2d07B8F2acFA69d92466B9535f717' })
};
