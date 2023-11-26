const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Tokens held in coinbase custody. Reserve info taken from: https://hope.money/gomboc.html',
  doublecounted: true,
  bitcoin: {
    tvl: sumTokensExport({ owners: [
      '15PYHP5ZW29B3o19jFNKz6RyRdHCtzJj5H',
      '16BLcAyJR8unm8RpQT9PGTwh5uPpZEf2ut',
      '3JoCB8ifwhL4YKo9rCYMgVGbqxBqnpQpdS',
      '179fgM9yyTHj4ZCTfAcGhUFiQMXuPx5xrF',
      '1LaC3Xt8RZWYH1pjcvXxrWxLvXe7iR3ybe'
    ]})
  },
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.null, '0x088117eD2b7ac7aE1801Fac4f359E1aeD95ca866'],
        [ADDRESSES.null, '0x86Edc8da69261F4d6623B3a2494BA262Dc454B7f'],
        [ADDRESSES.null, '0xDaC46e85f075512e9b4EF0cab58B6F21434eB253'],
        [ADDRESSES.ethereum.STETH, '0x088117eD2b7ac7aE1801Fac4f359E1aeD95ca866'],
        ['0xF1376bceF0f78459C0Ed0ba5ddce976F1ddF51F4', '0x6719f5e18B77C178793e6937d947bb00584E1b9e']
      ]
    })
  }
}