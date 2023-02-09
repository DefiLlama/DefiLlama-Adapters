const { cexExports } = require('../helper/cex')

const config = {
  bsc: {
    owners: [
        '0xC7029E939075F48fa2D5953381660c7d01570171'
    ],
  },
  ethereum: {
    owners: ['0x562680a4dc50ed2f14d75bf31f494cfe0b8d10a1']
  },
  tron: {
    owners: [
               'TS9b9boewmB6tq874PnVZrKPf4NZw9qHPi',
               'TFPqi7KTRwi2tihwS5dp1QomHowp1x2f45',
            ]
  },
  bitcoin: {
    owners: ['1MiFZMJkFMhMrubjjo6f5oEhh7XgSwXWgp']
  },
  ripple: {
    owners: ['rJKBidE4Av6ZaFTBcAucZXCpU7QvNXyfpT']
  },
  arbitrum: {
    owners: ['0xd690a9DfD7e4B02898Cdd1a9E50eD1fd7D3d3442']
  },
  avax: {
    owners: ['0x6C2e8d4F73f6A129843d1b3D2ACAFF1DB22E3366']
  },
  polygon: {
    owners: ['0xb34ed85bc0b9da2fa3c5e5d2f4b24f8ee96ce4e9']
  },
  optimism: {
    owners: ['0xfa6cf22527d88270eea37f45af1808adbf3c1b17']
  },
  fantom: {
    owners: ['0xc62A0781934744E05927ceABB94a3043CdCfEA89']
  },
  eos:{
    owners: ['hotbitioeoss']
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We have collect this wallets from Hotbit Team on the 14/12/22'