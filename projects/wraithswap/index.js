const { uniTvlExports } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
module.exports = uniTvlExports({
  'fantom': '0xCC738D2fDE18fe66773b84c8E6C869aB233766D1'
}, { staking: { fantom: ['0x37b106f101a63D9d06e53140E52Eb6F8A3aC5bBc', '0x4cf098d3775bd78a4508a13e126798da5911b6cd']}})
