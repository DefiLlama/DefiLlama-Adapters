const {uniTvlExport} = require("../helper/calculateUniTvl");
const { staking } = require("../helper/staking");

const factory = "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7";

module.exports = {
  bsc:{
    staking: staking("6a8dbbfbb5a57d07d14e63e757fb80b4a7494f81", "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5"),
    tvl: uniTvlExport(factory, "bsc", true) 
  }
};
