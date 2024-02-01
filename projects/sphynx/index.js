const { getUniTVL } = require('../helper/unknownTokens')
const config = {
  bsc: '0x8BA1a4C24DE655136DEd68410e222cCA80d43444',
  cronos: '0x5019EF5dd93A7528103BB759Bb2F784D065b826a',
  bitgert: '0xd4688F52e9944A30A7eaD808E9A86F95a0661DF8',
  // ethereum: '0x5Fc2b10Efb7C202Ab84ffF9Ea54d240280421D4b',
  // polygon: '0xF902beC4aFEcd6b9d9998F582f580Be6994A56aB',
  loop: '0xc0246b4f24475a11ee4383d29575394dc237fc36',
  // okexchain: '0xd38Ec16cAf3464ca04929E847E4550Dcff25b27a',
  // avax: '0x4faAFf0925886AcC7B6fE752F50d244E32248700',
  // arbitrum: '0x945905D2E8D14fD58E156684Ad56a71cb02F2F02',
  // optimism: '0xb37C9656e88927F9CAa6177ac409EF31f85f789A',
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = { tvl: getUniTVL({ factory, useDefaultCoreAssets: true }) }
})
