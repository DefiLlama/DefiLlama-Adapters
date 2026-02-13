const { compoundExports2, methodology } = require('../helper/compound')

const blacklistedTokens = [
  '0x7F3C2A5bCA48150c7Ce07DcEAb9B73336a7e592a', // enzoBTC - only one depositor, no borrow
  '0x963Db326b734FD58a9396C020BBb52C14acaFb02', // M-BTC - a few deposits, no borrow
  '0xabFb7A392a6DaaC50f99c5D14B5f27EFfd08Fe03', // uBTC - a few deposits, no borrow
]

module.exports = {
  sei: compoundExports2({ comptroller: '0x71034bf5eC0FAd7aEE81a213403c8892F3d8CAeE', blacklistedTokens }),
  methodology,
}