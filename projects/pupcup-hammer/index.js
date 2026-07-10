const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  methodology: "TVL is the total PUPCUP tokens held in PupCup Hammer's bridge escrow contracts on Ethereum and Base. Tokens are locked in escrow while bridged between chains.",
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x28c0cd9a2cda9f84011a8da9826d2ece5e7bc731',
      tokens: ['0x884649f1fE3Bf3Ae0Bd720Eaf660cB561dcE39ef'],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: '0x8c16a30c63964bbe29f83241a574cbeaae2ba6dc',
      tokens: ['0x42bab297f90e6285546f05abdf4c42d8415e9794'],
    }),
  },
}
