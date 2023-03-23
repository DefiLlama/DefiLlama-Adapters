const {uniTvlExport} = require("../helper/calculateUniTvl");

const factory = "0x73d9f93d53505cb8c4c7f952ae42450d9e859d10";

module.exports = {
  bsc: { tvl: uniTvlExport(factory, 'bsc') }
};
