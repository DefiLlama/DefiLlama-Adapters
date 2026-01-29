const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  sei: {
    tvl: sumTokensExport({
      owners: [
        '0x60B5C6dc0C523a4d17111d6cfB915D8983A66030'
      ], tokens: ['0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392']
    })
  },
  methodology: `TVL is the total USDC (Sei) held in the airdrop contract(s) backing the value of sold-out $PCT tokens.`
}