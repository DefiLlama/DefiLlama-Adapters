const { cexExports } = require('../helper/cex')

const config = {
  bsc: {
    owners: [
      '0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD', //main wallet
      '0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9', //broker account on Binance
      '0x57078A682ac277D444D8CeE278Dc6E2Ff0A52eA8'  //broker account on gate io
    ]
  },
  base: {
    owners: [
      '0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD', //main wallet
    ]
  },
  arbitrum: {
    owners: [
      '0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD', //main wallet
    ]
  },
  ethereum: {
    owners: [
      '0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD', //main wallet
      '0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9' //broker account on Binance
    ]
  },
  avax: {
    owners: [
      '0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD', //main wallet
      '0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9' //broker account on Binance
    ]
  },
  polygon: {
    owners: [
      '0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD', //main wallet
      '0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9' //broker account on Binance
    ]
  },
  optimism: {
    owners: [
      '0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD', //main wallet
      '0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9' //broker account on Binance
    ]
  },
}

module.exports = cexExports(config)