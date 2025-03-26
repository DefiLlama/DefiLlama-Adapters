const { gmxExports } = require('../helper/gmx')

module.exports = {
  core: {
    tvl: gmxExports({ vault: '0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207', fromBlock: 20537386, }),
  },
}