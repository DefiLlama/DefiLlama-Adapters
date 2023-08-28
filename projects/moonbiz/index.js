const { uniTvlExport } = require("../helper/unknownTokens");

const factory = "0x9B2593839E1390ECee3B348a47B3D93b2Ec2834C";

module.exports = uniTvlExport('bsc', factory, { fetchBalances: true, })
