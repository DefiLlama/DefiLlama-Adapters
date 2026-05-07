const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  sei: {
    tvl: sumTokensExport({
      owners: [
        '0x84948feBDffaE3a62d7Ac05B1428B3a6cC2BfBA4'
      ], tokens: ['0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392']
    })
  },
  methodology: `TVL is the total USDC (Sei) held in the airdrop contract(s) backing the value of sold-out $PCT tokens.`
}