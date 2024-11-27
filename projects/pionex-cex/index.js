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
      "0x02104cae462af17739cc4315ef9ac710a9ed22a7"
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
      "TAA7sxJ259JgstGPjanb5sB6ZJuCPtCobs"
    ],
  },
}

module.exports = cexExports(config)