const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'morph': '0x8D2A8b8F7d200d75Bf5F9E84e01F9272f90EFB8b'
}, {
  blacklistedTokens: [
    '0x2840F9d9f96321435Ab0f977E7FDBf32EA8b304f',
    '0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc',
  ],
})