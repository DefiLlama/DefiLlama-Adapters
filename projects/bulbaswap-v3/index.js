const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({ morph: { factory: '0xFf8578C2949148A6F19b7958aE86CAAb2779CDDD', fromBlock: 25159, blacklistedTokens: [
  '0x6A9A65B84843F5fD4aC9a0471C4fc11AFfFBce4a',
  '0xe3C0FF176eF92FC225096C6d1788cCB818808b35',
  '0x950e7FB62398C3CcaBaBc0e3e0de3137fb0daCd2',
] } })