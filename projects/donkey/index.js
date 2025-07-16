const { compoundExports2 } = require('../helper/compound');
const { staking } = require('../helper/staking');

const controllerAddress = {
  ethereum: '0x55e41bc3a99aa24E194D507517b1e8b65eFdAa9e',
  klaytn: '0x35dc04eE1D6E600C0d13B21FdfB5C83D022CEF25'
}

const stakings = [
  '0x4f2ED52bC4CbdE54e2b3547D3758474A21598D7c',
  '0x024510151204DeC56Cc4D54ed064f62efAC264d5',
  '0x2EacD2D7cF5Cba9dA031C0a9C5d7FDeDc056216C',
  '0x8c9886Aca8B6984c10F988078C5e1D91976dFD16',
  '0x63D21dBD5A30940C605d77882D065736e8fffC94',
]

const DONKEY_TOKEN = '0x4576E6825B462b6916D2a41E187626E9090A92c6'


module.exports = {
  ethereum: {
    staking: staking(stakings, DONKEY_TOKEN),
    ...compoundExports2({ comptroller: controllerAddress.ethereum, cether: '0xec0d3f28d37a3393cf09ee3ad446c485b6afdaa3' }),
  },
  klaytn: compoundExports2({ comptroller: controllerAddress.klaytn, cether: '0xacc72a0ca4e85f79876ed4c5e6ea29be1cd26c2e'}),
}
