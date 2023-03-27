
const {uniTvlExport} = require("../helper/calculateUniTvl");

const factory = "0x670f55c6284c629c23baE99F585e3f17E8b9FC31";

module.exports = {
  bsc: { 
    tvl: uniTvlExport(factory, 'bsc'), }
}
