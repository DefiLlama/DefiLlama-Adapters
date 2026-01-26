const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x0c01089AEdc45Ab0F43467CCeCA6B4d3E4170bEa',
        '0x2864DE013415B6c2C7A96333183B20f0F9cC7532',
        '0x8550E644D74536f1DF38B17D5F69aa1BFe28aE86',
        '0xd03be958e6b8da2d28ac8231a2291d6e4f0a7ea7',
        '0xd6e0F7dA4480b3AD7A2C8b31bc5a19325355CA15',
        '0xe5d7ccc5fc3b3216c4dff3a59442f1d83038468c',
        '0xe83a48cae4d7120e8ba1c2e0409568ffba532e87',
        '0xf0bc8FdDB1F358cEf470D63F96aE65B1D7914953',
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.korbit
  },
  ripple: {
    owners: [
        'r9WGxuEbUSh3ziYt34mBRViPbqVxZmwsu3',
        'rGU8q9qNCCQG2eMgJpLJJ1YFF5JAbntqau',
        'rGq74nAmw1ARejUNLYEBGxiQBaoNtryEe9',
        'rJRarS792K6LTqHsFkZGzM1Ue6G8jZ2AfK',
        'rNWWbLxbZRKd51NNZCEjoSNovrrx7yiPyt',
        'rsYFhEk4uFvwvvKJomHL7KhdF29r2sw9KD'
    ]
  }
}

module.exports = cexExports(config)