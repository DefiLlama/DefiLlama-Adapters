const { uniTvlExport } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

const getExport = factory => uniTvlExport("linea", factory, { hasStablePools: true, useDefaultCoreAssets: true, })

module.exports = mergeExports(['0x6ed7b91c8133e85921f8028b51a8248488b3336c', '0xbc7695fd00e3b32d08124b7a4287493aee99f9ee'].map(getExport))

