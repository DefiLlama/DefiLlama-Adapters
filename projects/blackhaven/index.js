const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "USDM and Aave USDM held by the treasury, ensuring the backing of the RBT token",
  megaeth: {
    tvl: sumTokensExport({
        owner: "0xb59126f8a13F907f63e67CFc248160698cE41918",
        tokens: ["0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7", "0x5dF82810CB4B8f3e0Da3c031cCc9208ee9cF9500"]
      })
  }
}