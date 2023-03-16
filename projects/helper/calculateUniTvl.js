const { getUniTVL } = require('./cache/uniswap')

function uniTvlExport(factory, chain, transformAddressOriginal = undefined, abis) {
  return getUniTVL({ chain, factory, abis })
}

module.exports = {
  uniTvlExport,
};
