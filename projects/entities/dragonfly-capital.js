const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0xB953E202C5E51C7C010E80402a63C02f37F14059", //1.9m$ in cega protocol
       // "0xe4A2410e158a790463ba1b2c98693061f5A3A9EF", old wallet not sure if related
       // "0x30BDC51A48272F96480921ea280448695D2B5d6F", old wallet not sure if related
        "0x221E3c87A034E79Dd16d64762a1B20FB71594F46",
        "0xF410dC5Ff862BfD36111aD492123280dDB23D495",
       // "0xEC4b615C8aBfB491cD4227b165A1e389DB5e8286", old wallet not sure if related
        "0xB93994e2efCAed3E88C538F68eC6A2587C3E2ebF",
        "0x002A5dc50bbB8d5808e418Aeeb9F060a2Ca17346"
    ],
  },
}

module.exports = cexExports(config)