const { gmxExports } = require('../helper/gmx')

module.exports = {
  core: {
    tvl: gmxExports({ vault: '0x129ba01921D37D3285F557C57397dc2b0a18B4d2', fromBlock: 25450000, }),
  },
}