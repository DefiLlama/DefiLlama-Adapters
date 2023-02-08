const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos')


async function tvl() {
  const uskCDPs = [
    "kujira1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2smfdslf",
    "kujira1f2jt3f9gzajp5uupeq6xm20h90uzy6l8klvrx52ujaznc8xu8d7s6av27t", 
    "kujira1eydneup86kyhew5zqt5r7tkxefr3w5qcsn3ssrpcw9hm4npt3wmqa7as3u",
    "kujira1fjews4jcm2yx7una77ds7jjjzlx5vgsessguve8jd8v5rc4cgw9s8rlff8",
    "kujira1r80rh4t7zrlt8d6da4k8xptwywuv39esnt4ax7p7ca7ga7646xssrcu5uf",
    "kujira1m0z0kk0qqug74n9u9ul23e28x5fszr628h20xwt6jywjpp64xn4qkxmjq3",
    "kujira1pep6vkkjexjlsw3y5h4tj27g7s58vkypy8zg7f9qdvlh2992pncqduz84n",
    "kujira1hjyjafrt09p4hwsnwch29nrrs40lprfgesqdy44wnp27td872hsse2rree",
    "kujira1m4ves3ymz5hyrj3war3t7uxu9ewt8rwpunja87960n0gre3a5pzspgry4g",
    "kujira1722g2rudg0rlw45nuuvjhg4a365xztfrdfjgyyfuzlmqmtu2plas34y6x3",
    "kujira1twc28l5njc07xuxrs85yahy44y9lw5euwa7kpajc2zdh98w6uyksvjvruq",
    "kujira1mjdmut3vq7n7zv6p9kdkdng0zpk2286qww0yy0ay4e8cvxd5p2zqvh9aqs"
  ]
  const owners = [
    ...uskCDPs,
  ]
  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  kujira: {
    tvl,
  },
}