const { uniTvlExport } = require('../helper/unknownTokens');

module.exports = uniTvlExport('bsc', '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C', { useDefaultCoreAssets: true, blacklistedTokens: [
  '0x1a515bf4e35AA2DF67109281DE6B3b00Ec37675E', '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
] })
