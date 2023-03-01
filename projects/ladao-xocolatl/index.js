const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: "Counts all the tokens being used as collateral in the House of Reserves contracts that back $XOC. $XOC is the first decentralized stablecoin with peg close to the mexican (MXN) peso.",
  polygon: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', '0xd411BE9A105Ea7701FabBe58C2834b7033EBC203'],
        ['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', '0x09dFC327364701d73683aCe049B8A5a8Ea27F3E8'],
      ]
    })
  },
}