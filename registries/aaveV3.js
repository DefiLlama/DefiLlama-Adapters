const { aaveV3Export } = require('../projects/helper/aave')
const { buildProtocolExports } = require('./utils')

function aaveV3ExportFn(chainConfigs) {
  return aaveV3Export(chainConfigs)
}

const configs = {
  'aave-horizon': {
    ethereum: ['0x53519c32f73fE1797d10210c4950fFeBa3b21504'],
  },
  'tydro': {
    ink: '0x96086C25d13943C80Ff9a19791a40Df6aFC08328',
  },
  'voltage-lending': {
    fuse: ['0x87cB512CFB0f18F4Dd9652a186922cf6A4e63213'],
  },
  'unilend-protocol': {
    unit0: ['0x99118c1Ca7D0DC824719E740d4b4721009a267d6'],
  },
}

module.exports = buildProtocolExports(configs, aaveV3ExportFn)
