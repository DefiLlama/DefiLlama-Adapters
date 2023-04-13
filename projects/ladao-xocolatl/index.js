const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: "Counts all the tokens being used as collateral in the House of Reserves contracts that back $XOC. $XOC is the first decentralized stablecoin with peg close to the mexican (MXN) peso.",
  polygon: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', '0xd411BE9A105Ea7701FabBe58C2834b7033EBC203'],
        ['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', '0x09dFC327364701d73683aCe049B8A5a8Ea27F3E8'],
        ['0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6','0x983A0eC44bf1BB11592a8bD5F91f05adE4F44D81'],
        ['0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270','0xdB9Dd25660240415d95144C6CE4f21f00Edf8168']
      ]
    })
  },
}