const { getUniTVL } = require('./helper/unknownTokens');

const factory = '0x1E2C2102cf8EfCaAAf20fFe926469EC7cD0d0f6E'
// const factory2 = '0xBbE026500E273e2F2E6b41C93d11fE6d5c6D71bF'
module.exports = {
    ethereum: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory, })
  }
};