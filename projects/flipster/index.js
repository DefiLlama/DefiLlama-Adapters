const ADDRESSES = require('../helper/coreAssets.json')
const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      '0xd49417f37cED33aBA35DDAbf208D5bFcD87b4eBe',
      '0x25F6710AF9866971A3CCaaf8895e286F6ccDa9F6',
      '0x711948E4d826A37Aa564C41c7B50de7E45c9Ee44',
      '0x8C50172e1534826F40C288A41793cFc57bB37538',
      '0xd157bD19Ea0953f8B29E34b4Bee08fC4cba2B6a4',
    ],
  },
  tron: {
    owners: [
        'TA6SbszfFYC7NYt48viCM9LMD5F5E1Gbi8',
        'TL3gWBCybJbvJt8CaLyxzUvQvyFYkCbmQR',
        'TApVQ5DRptVNyhxRpFn9DgYv6mgqtyPRjn',
        'TS5Btew8Wrk85cFx2kJ4gC28JsrFLXpJjU',
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
  sonic: {
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
  algorand: {
    owners: [
      'WECLYJ4ERN445J4Y4IDRV274HMFG7MJ3A2IWOUCHSUKEQNORIVW7QEKKNY'
    ]
  },
  base: {
    owners: [
      '0x8f4B87cE14F234163ed28AE7D79E138f07a71638'
    ]
  },
  blast: {
    owners: [
      '0xa63b24599110BB34c029164baB8F14013C4D877A'
    ]
  },
  celo: {
    owners: [
      '0xECfa1357a76499FF04C8306a869d518f2dD6297f'
    ]
  },
  // conflux: {
  //   owners: [
  //     'cfx:aajnh5j7c85prg3nf8kyg3hdawy4unyvf6bhdr1fkz'
  //   ]
  // },
  cosmos: {
    owners: [
      'cosmos1gcsur9g2vxagmyr0u7pc9kcvtyd7zuyen3n5x7'
    ]
  },
  klaytn: {
    owners: [
      '0x61e57F94FD0239EC568db7c4dd778f168c737682'
    ]
  },
  near: {
    owners: [
      'd09904357488c186e9105396dc32f1a1180bf9870a09c037b3282372e337e770'
    ]
  },
  sui: {
    owners: [
      '0xfcdde971bdb9105fc3cb1c95ca468e8b88d23c6594162b2d2b1dadf16acf5b3a'
    ]
  },
  aptos: {
    fungibleAssets: [ADDRESSES.aptos.USDt],
    owners: [
      '0x0613f31af70ce983b9dca574e033a52351fd2e67b1959bf48574c6e9c956f95e'
    ]
  },
  stable: {
    tokens: [ADDRESSES.stable.USDT0],
    owners: [
      '0x987753779885D0cB90E368070F54f220AE93E698'
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'All reserves information can be found here https://flipster.io/support/proof-of-reserves.'
