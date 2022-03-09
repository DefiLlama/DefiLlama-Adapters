const {uniTvlExport} = require("../helper/calculateUniTvl");
const { staking } = require("../helper/staking");

const factory = "0x0740fefb8a892a962916cccd4c38f75e5eab85eb";

module.exports = {
  bsc:{
    staking: staking("5867cd4f7e105878afbc903505c207eb7b130a50", "bsc"),
    tvl: uniTvlExport(factory, "bsc") 
  }
};
