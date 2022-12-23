const { uniTvlExport } = require("../helper/calculateUniTvl");

const factory = "0x1d1f1A7280D67246665Bb196F38553b469294f3a";

module.exports = {
    fuse: {
        tvl: uniTvlExport(factory, 'fuse'),
    }
}