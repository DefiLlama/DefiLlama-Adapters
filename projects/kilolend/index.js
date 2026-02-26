

const { compoundExports2 } = require('../helper/compound');

module.exports = {
    methodology: 'This gets the total value locked in KiloLend',
    bitkub: compoundExports2({ comptroller: '0x42f098E6aE5e81f357D3fD6e104BAA77A195133A', cether: '0x0cA8DaD1e517a9BB760Ba0C27051C4C3A036eA75' }),
    klaytn: compoundExports2({ comptroller: '0x2591d179a0B1dB1c804210E111035a3a13c95a48', cether: '0x2029f3E3C667EBd68b1D29dbd61dc383BdbB56e5' })
};