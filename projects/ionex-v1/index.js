const { uniTvlExport } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

const getExport = factory => uniTvlExport("plasma", factory, { hasStablePools: true, useDefaultCoreAssets: true, })

module.exports = mergeExports(['0xbf05db69176E47Bf89A6b19F7492d50751D20452'].map(getExport))

