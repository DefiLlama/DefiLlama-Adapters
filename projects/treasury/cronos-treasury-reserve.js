const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  cronos: {
    owners: ['0x96A6cd06338eFE754f200Aba9fF07788c16E5F20'],
    tokens: [
      '0x2e53c5586e12a99d4CAE366E9Fc5C14fE9c6495d', // CDCBTC
      '0x9Fae23A2700FEeCd5b93e43fDBc03c76AA7C08A6', // LCRO
      '0x7a7c9db510aB29A2FC362a4c34260BEcB5cE3446', // CDCETH
      '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', // USDC
      '0x0d0b4a6FC6e7f5635C2FF38dE75AF2e96D6D6804', // PACK
    ],
    ownTokens: ['0xF3672F0cF2E45B28AC4a1D50FD8aC2eB555c21FC'], // CTR
  },
})