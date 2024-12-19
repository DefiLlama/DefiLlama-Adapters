const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      "0xf6d4e5a7c5215f91f59a95065190cca24bf64554",
      "0x2a8a276019d3ec549ae657c945ef60aab4e33c9b",
      "0xa008dc1281aa6bff98b2c253ee8fd759ba918103",
      "0x28410a70acc5f01e4efe892bcc38b70f3bcf014b",
      "0x4608fbf5fd78879ba0a75c6c0b0f5e53e188d3e2",
      "0x5e483d7803a8b39f0d6792a0431176a91fde6e31",
      "0x7175a01564ac4a83dd396e288a2707dee86caf63",
      "0x4998cb57364531560f4048213ba9b529ec27f14f",
      "0x02104cae462af17739cc4315ef9ac710a9ed22a7",
      "0x3c22c17501047d862b3a98e296079966aefd8df7",
      "0xbbb72ba600d8493fea284d5fe44919f7b60d53f5",
      "0x67be8ce27ef8158d51d8593bb5b26eafacc955d9",
      "0xee5b5b923ffce93a870b3104b7ca09c3db80047a"
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.pionexCex,
  },
  tron: {
    owners: [
      "TYULGbfdheMSQBv7skFxNbgo7mbNjsWSrF",
      "TDr8tDBgYLtrfPmC4erXp7eRgvVNM32EKp",
      "TQZPjLBwG8JW7J8LJ3vBbXU6UxAyxH1367",
      "TDe3wqxhTSPimeQkJVKNBkCjRnUj839MKj",
      "TGMX4ipWLrjqZq7yM4cGVNr124BFrRYtWz",
      "TJZj4RS6v6U3HCpTSJ7CwNycRcoi7BREGx",
      "TLK8GVBqJNmcyaN5mpSPSzQfTjsSxb7sC9",
      "TGgMNPxdyUgdYwMSbMkpTPvaSkrRakKqcK",
      "TAA7sxJ259JgstGPjanb5sB6ZJuCPtCobs",
      "TJDENsfBJs4RFETt1X1W8wMDc8M5XnJhCe",
      "TKRksVBKDBATKcifm4FXFHcD1FmJQ2bp3x"
    ],
  },
  solana: {
    owners:[
      "DGFW1Effv88XzXkgfgyoFfmefzEU5Pp9zWJACBmCSh8K",
      "FXv8hUveo3Di254W5vycvouxrmTJG4oQ5QMm1tLhY3NF"
    ]
  },
  bsc: {
    owners:[
      "0xF6D4E5a7c5215F91f59a95065190CCa24bf64554",
      "0x67be8ce27ef8158d51d8593bb5b26eafacc955d9"
    ]
  },
  optimism:{
    owners: [
      "0xF6D4E5a7c5215F91f59a95065190CCa24bf64554"
    ]
  },
  arbitrum: {
    owners: [
      "0xF6D4E5a7c5215F91f59a95065190CCa24bf64554",
      "0x67be8ce27ef8158d51d8593bb5b26eafacc955d9"
    ]
  },

}

module.exports = cexExports(config)