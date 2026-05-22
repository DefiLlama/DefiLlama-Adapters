const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook['poloniex-cex'] ,
  },
  ethereum: {
    owners: [
      "0x8fca4ade3a517133ff23ca55cdaea29c78c990b8",
      "0x29065a4c1f2f20d1e263930088890d6f49fe715a",
      "0x176f3dab24a159341c0509bb36b833e7fdd0a132",
    ],
  },
  ripple: {
    owners: [
      "rwJXYKC1VMzGYc6RHnhnbe38syj5EE34cS",
      "rKv1CcnLFSjQ7ecowP8QpsHy3cMyNaC2ku",
      "rUYkx2mGm1m4wH75cgedu79vshbfDFUWj8",
    ],
  },
  tron: {
    owners: [
      "TWhDfwC8QE6pQyiYy248dNor3uphPEw5M2",
      "TSzSgxRisS5VBXXDcAezTDvnPGi9CbsXvJ",
      "TUgSgCQL6pMSy9zByn4sgxqrJa95sZExBG",
    ],
  },
  stellar: {
    owners: [
      "GCOND2ZGWNMSHNIHU24HBJAKYM6H2G6FYN5NRQ46BP6G7MZSO5IM2JEJ",
      "GCNFBPRT75HFWJJ45JUUVZKXKXNISW5H5OKLTZMZ6WLC4BINAGRJWAOU",
      "GCGXQEUNC6NFQYXH7AYK7LJKKDZHHEV2XM72NFNQ6ZI4CGNQJIKFHWWM",
    ],
  },
  solana: {
    owners: [
      "7Ci23i82UMa8RpfVbdMjTytiDi2VoZS8uLyHhZBV2Qy7",
      "Eueeb9FKXpk7duw7jKeYm1NNWmTeFN7fGKYMmasY7C9x",
      "31KVUP9uPsdUniHkSKDtsDqB1VksmKskreynTQ3xitKz",
    ],
  },
  ethereumclassic: {
    owners: [
      "0xc921bea90897596bf281e81bd329fa5f56b794ac",
      "0xbad1216f81caec7fb557f30c410187d66ee374b9",
      "0xBcEb3318d34a59FD1b91540E8EaDeD28aF6d249c",
    ],
  },
  polygon: {
    owners: [
      "0xcc0c098f170281810966b4133c794cb91c5587b2",
      "0x12a17c12d4db72e7c3d8f8ce10080904300086cd",
      "0x176f3dab24a159341c0509bb36b833e7fdd0a132",
    ],
  },
  arbitrum: {
    owners: [
      "0x920021936b28c93491a02f760fa20aa599083ed5",
      "0x126a65dd631eea1f6b2ce43288ca50aa771521ec",
      "0x176f3dab24a159341c0509bb36b833e7fdd0a132",
    ],
  },
  optimism: {
    owners: [
      "0x9f73a5a60e9a9c063bcc30631dbb738312145113",
      "0x1c8fdd3560748c1ff1b22dde7e025625629bdcc0",
      "0x176f3dab24a159341c0509bb36b833e7fdd0a132",
    ],
  },
  cardano: {
    owners: [
      "addr1vxn9jr4ewahttr8wd8d2a4n2jq96crcje0c8402s9spzppqgmv9hu",
      "addr1qy7kcd0qrvc5t6mqqacz8ta5jc9an6xj4uqavreey3gf45pads67qxe3gh4kqpmsywhmf9stm85d9tcp6c8njfzsntgqxsu4m8",
      "addr1qxyl2w9m3le06ap89j089tm90ks4xttscmz5yup4rupg7jnp2e4cx2g5aznrx754xufx4c63sz0rp2u3em6wktk8sp0qxrsrjl",
    ],
  },
};

module.exports = cexExports(config);
