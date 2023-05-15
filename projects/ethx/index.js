const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: staking('0x7b0Eff0C991F0AA880481FdFa5624Cb0BC9b10e1', [
      '0x0000000000000000000000000000000000000000',
      '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      '0x5E8422345238F34275888049021821E8E08CAa1f',
      '0xae78736Cd615f374D3085123A210448E74Fc6393',
    ]),
  }
}