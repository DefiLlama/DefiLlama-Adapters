const bscStaking = "0xE50cb76A71b0c52Ab091860cD61b9BA2FA407414";
const bscKnight = "0xd23811058eb6e7967d9a00dc3886e75610c4abba";

const ftmStaking = "0xb02e3A4B5ebC315137753e24b6Eb6aEF7D602E40";
const ftmKnight = "0x6cc0e0aedbbd3c35283e38668d959f6eb3034856";

const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'bsc': '0xf0bc2E21a76513aa7CC2730C7A1D6deE0790751f',
  'fantom': '0x7d82F56ea0820A9d42b01C3C28F1997721732218'
}, {
  staking: {
    bsc: [bscStaking, bscKnight,],
    fantom: [ftmStaking, ftmKnight,],
  },
})