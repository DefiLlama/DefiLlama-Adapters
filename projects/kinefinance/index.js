const { compoundExports2 } = require('../helper/compound');

const config = {
  ethereum: { comptroller: '0xbb7d94a423f4978545ecf73161f0678e8afd1a92', cether: '0xa58e822de1517aae7114714fb354ee853cd35780', kMcd: '0xaf2617aa6fd98581bb8cb099a16af74510b6555f' },
  bsc: { comptroller: '0x3c2ddd486c07343b711a4415cdc9ab90ed32b571', cether: '0x5fbe4eb536dadbcee54d5b55ed6559e29c60b055', kMcd: '0x4f1ab95b798084e44d512b8b0fed3ef933177986' },
  polygon: { comptroller: '0xdff18ac4146d67bf2ccbe98e7db1e4fa32b96881', cether: '0xf186a66c2bd0509beaafca2a16d6c39ba02425f9', kMcd: '0xcd6b46443becad4996a70ee3d8665c0b86a0c54c' },
  avax: { comptroller: '0x0ec3126390c606be63a0fa6585e68075f06679c6', cether: '0x0544be6693763d64c02f49f16986ba1390a2fc39', kMcd: '0xcd6b46443becad4996a70ee3d8665c0b86a0c54c' },
}

Object.keys(config).forEach(chain => {
  const {comptroller, cether, kMcd,} = config[chain]
  module.exports[chain] = {
    tvl: compoundExports2({ comptroller, cether, blacklistedTokens: kMcd ? [kMcd] : []}).tvl
  }
})