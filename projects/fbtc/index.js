const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  bitcoin: {
    tvl: sumTokensExport({
      owners: [
        // https://docs.fbtc.com/security/bitcoin-reserve-address
        'bc1q7jgulg69frc8zuzy0ng8d5208kae7t0twyfjwm',
        'bc1q6c3c0t3zvnphce37ufr4yz9veaqvew2wg0shwr',
        '3HjNJWcn2ayFLikzmKRaFtcbLufYChQo3T',
        '374vhN24WryvNWUUZR2uDAnL4oNP5EW4qR',
      ],
    }),
  }
}