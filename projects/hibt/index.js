const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x89a7f48b79516125c5521d5922a6dc0a085b3b95'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.hibt
  },
  tron: {
    owners: [
        'TWVCro8i15sJjmwRKfV53gPnCsgz2ThQSc',
        'TGoPfFBjoZ6wFFia1NAFio21Pi9Sc8KFw5'
    ]
  },
}

module.exports = cexExports(config)