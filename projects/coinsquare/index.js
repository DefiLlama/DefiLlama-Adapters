const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x02fdc44Bf226E49DCecA4775Afaef3360e9C4EE9',
        '0x0fcFF154753e337983613889b69dd85Fe8a1a145',
        '0x14AA1AD09664c33679aE5689d93085B8F7c84bd3', // avax too
        '0x3858A27eeCB5f1144473E35A293cb1B2bda6DfF4',
        '0x476B067CbFF8ACB805038E9dAEF5D51c7612d593',
        '0x48a0B5f7DE8789a3962918C6DF4A766c0c8857B0',
        '0x56E89a4b2E3924c336d52CE0ad98fF23E1a51627',
        '0x6A73f209d25CC9c089170cc5b54962e0c7614E0c',
        '0x6d712f120bD65aD54a5F56670976788a044Cb987',
        '0x7061d86A274B398a1fB7Cdb74B3abBc7601e105f',
        '0x7ee87dd5BB9924Cb85CA2916Bd4E04299D3A8EcC',
        '0x82Be7cFeF05B70c4AF47F8fd70F636201121341b',
        '0x8623c08A4B880799CF65E75137ec9759DB336637',
        '0x89813b57AE92e74Fb808eb7639d3A0050c9b3D7D',
        '0x8e080C5d233F2A14A37d024c0382bF0585146993',
        '0x910695E5C7c14499B554fb132A9710988a42fC38',
        '0x9C6D4A1922Eed56Ee9de148c5BA9b1b477FEcBb6',
        '0xC4d75abAb14Ef006d5Ac9fe901a8ed616C4e2627',
        '0xD381347EE757F53aE4B3b6822DAeC3E2A14B2005',
        '0xD5B2C371808018ee131ad387877C4d58e08e7A06',
        '0xd093F2Ee92cf32B4D3EBefd965447415074DD6c8',
        '0xf9c91937737cCaFE9bBb662b1917B54F9606Ca13',
        '0xfac596Facd1901458C1C6347397a6e5D0769736c',
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.coinsquare
  },
  avax: {
    owners: ['0x14AA1AD09664c33679aE5689d93085B8F7c84bd3']
  },
  solana: {
    owners: ['4DgunMfBb19GaMZ1Z48oqcymZ4eBA4v5SUdRnapzj66G']
  },
  cardano: {
    owners: ['addr1vysfm34dhk3an94lz0s8p76rcze7ee5060dp9uenku5g2jc9dapls']
  },
  cosmos: {
    owners: ['cosmos12chvl78ffgvzc29mvrg5auz94vgksne5svsje4']
  },
  ripple:{
    owners: [
        'rBrgepoU9B4tZkXKsp9oHns252mkAFLrYj',
        'rsae9sMcxRe9WXHFM3WJJ3NdZESaoRY3KC'
    ]
  },
  litecoin: {
    owners: [
         'LNwvCzirtdVFTeG3YcQZ3Cg7FPCwmyeYJm',
         'LeZcdqjgfd3L8vDVYWGuFvrJyT2Xy9grCf',
         'LYSR1E7kzoxnX8fbgRgDUJo1VVd2H1vwXF',
         'LPosd2yrP7RNP688yFTuMnMnhSrs5zLPia',
         'LPVrozsF3z6C6mYRGKN6xRCHs7dm1htTYs',
         'Lax8DbJauyWhV5YNTaeZge4oBP2HTNiqYz',

    ]
  },
  doge: {
    owners: [
        'D9uH999MANKyNkzfb8XwRmQhHEBNLBh9sA',
        'DQNrmw9tb9NDxyhjb6BvJnvAvDBC3CMurE',
        'DAMt5CrmkVuiNDEWCWRiyecpvNKi58FSbd',
        'DGXx3yTPND5E7uJdCzLe945ri6Qa9as3Go',
        'DAd1JWwtwx1paUuWG71ePNLU3WJUFaMJoh'
    ]
  }
}

module.exports = cexExports(config)