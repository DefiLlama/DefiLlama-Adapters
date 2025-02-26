const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      '0xc21a1d213f64fedea3415737cce2be37eb59be81',
      '0x199BF7d50A4C00dae8395457A507613ae098fF60',
      '0x5C133736f0762bD1Bb21455a10a167A8D2500d1F',
      '0xe851d077836Cc48E4a09B0B4ed984AcBdE358b57',
      '0x2A747aa880138042de556195262f01779d4CFc91',
      '0xb25FfAC8F2dd4696a02c3fE312E1E9c907aF74d5',
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.fastex
  },
  tron: {
    owners: [
      'TPj7TCJ9rxdd243yQ3tc7iJzqcEYtupB4v',
      'TXW8f2umgDJhVarwosuGW1d8Wr4FaPpAEb',
      'TDwRF28KJQhcGV46yRDFXgFdcLbztjxVbs'
    ]
  },
  ripple: {
    owners: [
      'rNxBjsC1FsEga35GThyb1KXAyS3kDx8gyv',
      'rMnR4pWoDW2kUSZ7hxnpy2it9ojEdQwc6s',
    ]
  },
  cardano: {
    owners: [
      'addr1q8yrpu5fw3qw62fjezu72pap8munej98zpgmxgrye6rw6nkc65axaph2qhcn9f08edaujlju8uflqpra9sqyz96w7rpqmn48ww',
    ]
  },
  arbitrum: {
    owners: [
      '0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81',
    ]
  },
  aptos: {
    owners: [
      '0x41a7160155e2d946918fe7969e83f1f70840cf808a7f6e15a18bf6505453ec73',
    ],
  },
    optimism:{
    owners: [
      '0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81',
    ]
  },
  solana: {
    owners: [
      'BRvrp5WQkVuda1BAxfaBTpbBW4b73GhNp7AW7NcBs596',
    ]
  },
  avax:{
    owners:[
      '0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81',
    ]
  },
  bsc: {
    owners: [
     '0x85E1De87a7575C6581F7930F857a3813B66A14d8',
    ],
  },
  polkadot:{
    owners: [
      '16iUCscbCHM5mkszPaogRJioxHRbew8YB34nWqsoMkaX1XDZ',
    ]
  },
  ftn: {
    owners: [
      '0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81',
    ]
  },
  litecoin: {
    owners: [
      'ltc1qy4400xa5r72lsysd7xvjks08r5lrzr5fu0udx7'
    ]
  },
}

module.exports = cexExports(config)
