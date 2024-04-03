const { gmxExports } = require('../helper/gmx')

module.exports = {
  fantom: {
    tvl: gmxExports({ vault: '0x58e3018B9991aBB9075776537f192669D69cA930', })
  },
  bsc: {
    tvl: gmxExports({ vault: '0x089Bd994241db63a5dc5C256481d1722B23EF8d0', })
  },
}