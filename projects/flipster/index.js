const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      '0xd49417f37cED33aBA35DDAbf208D5bFcD87b4eBe'
    ],
  },
  tron: {
    owners: [
        'TA6SbszfFYC7NYt48viCM9LMD5F5E1Gbi8',
    ]
  },  
  bitcoin: {
    owners: bitcoinAddressBook.flipster
  },  
  arbitrum: {
    owners: [
        '0xa9b686EE77EfC18e7a08c48FA823CAA0cfDd754E'
    ]
  },  
  optimism: {
    owners: [
        '0x27605eb3BAae062459e1291A65137Da109B1440D'
    ]
  },  
  ripple: {
    owners: [
        'rDjLFq7ZxUx9iYQ1jV5MYbLHnBsSkyfqj3'
    ]
  }, 
  fantom: {
    owners: [
        '0xeeebcdf3ddd52d4Ab34EFA127a0d6b74385062Ac'
    ]
  }, 
  solana: {
    owners: [
        'FgQygQyFJ5SB8idVQcee6v1uGoQbJMyVhW8BFPTAEpat'
    ]
  }, 
  avax: {
    owners: [
        '0x04723FcDAD0d2A201EbBeD043714fD52651e0C5e'
    ]
  }, 
  bsc: {
    owners: [
        '0xCD47f02B261426Ab734Be9271156327327407E43'
    ]
  }, 
  polygon: {
    owners: [
        '0xfA705a98FA89134F460Bf79457D4fbd3d8E118d9'
    ]
  }, 
  ton: {
    owners: [
        'EQDQpuuVQI6Vzpewyll_xSP_SAlSNjXo9RngD9y99C8MVJri',
        'EQBlnb9GCDGnJ5XEqamHL7Sj5_0wJ4MGja5T6PKlwVAISgrW',
    ]
  }, 
}

module.exports = cexExports(config)
module.exports.methodology = 'All reserves information can be found here https://flipster.io/support/proof-of-reserves.'