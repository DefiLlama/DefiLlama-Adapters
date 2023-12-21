const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: ['0x328130164d0f2b9d7a52edc73b3632e713ff0ec6',
             '0xeacb50a28630a4c44a884158ee85cbc10d2b3f10',
             '0x3ab28ecedea6cdb6feed398e93ae8c7b316b1182',
             '0x7563758243a262e96880f178aee7817dcf47ab0f']
  },
}

module.exports = cexExports(config)
