const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  ethereum: '0x5FA0060FcfEa35B31F7A5f6025F0fF399b98Edf1',
  bsc: '0xE52cCf7B6cE4817449F2E6fA7efD7B567803E4b4',
  fantom: '0xb8baf2195BfC67845049f49af9d4858F7D9c2b30',
  polygon: '0xd956dEd6BFc7ED1C1Aa8c7954EB0ECd1E00e71b8',
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory, })
  }
})
