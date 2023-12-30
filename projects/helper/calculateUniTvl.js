const { getUniTVL } = require('./cache/uniswap')

function uniTvlExport(factory, chain, useDefaultCoreAssets = false, abis, options = {}) {
  if (useDefaultCoreAssets) options.useDefaultCoreAssets = true
  return getUniTVL({ chain, factory, abis, ...options })
}

module.exports = {
  uniTvlExport,
};
