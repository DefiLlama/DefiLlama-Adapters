const { stakings } = require('../helper/staking')

const minto = '0x410a56541bD912F9B60943fcB344f1E3D6F09567'
const hminto = '0x410a56541bd912f9b60943fcb344f1e3d6f09567'
const stackingContracts = [
  '0x78ae303182fca96a4629a78ee13235e6525ebcfb',
  '0xe742FCE58484FF7be7835D95E350c23CE55A7E12',
]

module.exports = {
  bsc: {
    staking: stakings(stackingContracts, minto)
  },
  heco: {
    tvl: () => ({}),
    staking: stakings(stackingContracts, hminto)
  }
}
