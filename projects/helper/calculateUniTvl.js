const { getUniTVL } = require('./cache/uniswap')

function uniTvlExport(factory, chain, transformAddressOriginal = undefined, abis, options = {}) {
  return getUniTVL({ chain, factory, abis, ...options })
}

module.exports = {
  uniTvlExport,
};
