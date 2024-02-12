const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0xc21a1d213f64fedea3415737cce2be37eb59be81',
        '0x85e1de87a7575c6581f7930f857a3813b66a14d8',
    ],
  },
  bitcoin: {
    owners: [
        'bc1qs7yen7ljpvyw7vn58ql6zfaddqf4rcjalsgmt5'
    ]
  },
  tron: {
    owners: [
        'TPj7TCJ9rxdd243yQ3tc7iJzqcEYtupB4v'
    ]
  },
}

module.exports = cexExports(config)