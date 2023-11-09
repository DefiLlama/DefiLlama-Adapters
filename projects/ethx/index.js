const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: staking('0x7b0Eff0C991F0AA880481FdFa5624Cb0BC9b10e1', [
      ADDRESSES.null,
      ADDRESSES.ethereum.STETH,
      '0x5E8422345238F34275888049021821E8E08CAa1f',
      ADDRESSES.ethereum.RETH,
    ]),
  }
}