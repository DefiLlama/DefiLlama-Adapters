const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x89a7f48b79516125c5521d5922a6dc0a085b3b95',
        '0x7C32c1b93aC6c9719C9f3c7F8BAAbE502Bbd0F47'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.hibt
  },
  tron: {
    owners: [
        'TWVCro8i15sJjmwRKfV53gPnCsgz2ThQSc',
        'TFBzK6KWDiGMGkcK7mg7YH6Ls2Q4ouDFam',
        'TGoPfFBjoZ6wFFia1NAFio21Pi9Sc8KFw5'
    ]
  },
}

module.exports = cexExports(config)