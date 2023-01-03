const { gmxExports } = require('../helper/gmx')

module.exports = {
  aurora: {
    tvl: gmxExports({ vault: '0x5827094484b93989D1B75b12a57989f49e3b88B0', })
  },
  optimism: {
    tvl: gmxExports({ vault: '0x5827094484b93989D1B75b12a57989f49e3b88B0', })
  },
}