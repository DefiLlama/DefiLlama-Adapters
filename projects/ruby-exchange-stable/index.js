const { sumTokensExport } = require('../helper/unwrapLPs')
module.exports = {
  europa: { tvl: sumTokensExport({
    ownerTokens: [
      [ [
        '0x73d22d8a2D1f59Bf5Bcf62cA382481a2073FAF58',
        '0x1c0491E3396AD6a35f061c62387a95d7218FC515',
        '0x5F795bb52dAC3085f578f4877D450e2929D2F13d',
        '0xD05C4be5f3be302d376518c9492EC0147Fa5A718',
      ], '0x45c550dc634bcc271c092a20d36761d3bb834e5d']
    ]
  })}
}
