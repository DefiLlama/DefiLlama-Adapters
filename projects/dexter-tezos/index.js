const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  tezos: {
    tvl: sumTokensExport({
      owners: [
        'KT1Puc9St8wdNoGtLiD2WXaHbWU7styaxYhD',
        'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9',
        'KT1DrJV8vhkdLEj76h1H9Q4irZDqAkMPo1Qf',
        'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N',
        'KT1Xf2Cwwwh67Ycu7E9yd3UhsABQC4YZPkab',
        'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6',
        'KT19c8n5mWrqpxMcR3J687yssHxotj88nGhZ',
        'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU',
      ]
    }),
  }
}