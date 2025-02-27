const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      "0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4",
      "0xA7A93fd0a276fc1C0197a5B5623eD117786eeD06",
      "0xe1ab8c08294F8ee707D4eFa458eaB8BbEeB09215",
      "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A",
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40", // multiple chains
      "0x88a1493366d48225fc3cefbdae9ebb23e323ade3",
      "0x6Bd869be16359f9E26f0608A50497f6Ef122eE3E",
      "0x922fa922da1b0b28d0af5aa274d7326eaa108c3d",
      "0xbaed383ede0e5d9d72430661f3285daa77e9439f",
      "0x412dd3f282b1fa20d3232d86ae060dec644249f6",
      "0x77ec2176824df1145425eb51b3c88b9551847667",
      "0xf475388222e37ed28578fb43c02520bccb5443b6",
      "0xb627cb720a34b7bb7ded80263571b26f3acaf16b",
      "0x04fcd675f63b1ac987c650567977523e85a78135",
      "0xf579d6086cd6e557fb18c440582b2ed56a1c48e1",
      "0x6F4565c9D673DBDD379ABa0b13f8088d1AF3Bb0C",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.bybit,
  },
  bsc: {
    owners: [
      "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A",
      "0xf89d7b9c864f589bbf53a82105107622b35eaa40",
      "0x88a1493366d48225fc3cefbdae9ebb23e323ade3",
      "0x388E52979AC487c6BdaFCC84B251976Cd162790b",
    ],
  },
  tron: {
    owners: [
      "TB1WQmj63bHV9Qmuhp39WABzutphMAetSc",
      "TBpr1tQ5kvoKMv85XsCESVavYo4oZZdWpY",
      "TKFvdC4UC1vtCoHZgn8eviK34kormXaqJ7",
      "TQVxjVy2sYt4at45ezD7VG4H6nQZtsua5C",
      "TS9PDCB6vzLYDCPr5Nas2yzekdr7ot6dxn",
      "TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa",
      "TXRRpT4BZ3dB5ShUQew2HXv1iK3Gg4MM9j",
      "TYgFxMvvu2VHFJnxQf8fh1qVAeMfXZJZ3K",
      "TB1cPNTPE2yKRbyd5C3hd9KMXgb8HqW1CM",
      "TTH75Z9rfRgzCLNDDYBaR2WjUvuSDRtSMg",
      "TFbrM6tiw4A3AhFQAyY7u6jYs7m2HFKavU",
      "TUCS5ToZvL23Q6kKtWUhAGgMfJBwPUZgfu",
      "TF1yVgYNJYx8AEtKLhjd2YbLJ33uyWu9Eo",
      "THRKrcUPirR6GU6qvsKAv2M6PUBcwe6ruD",
      "TMB53f4eYhEhTqkuzKRNDoDNu5Ma5DtMSc",
      "TTT5cF5aPZjF6FkPJqV4MmnuykMACjDvmb",
    ],
  },
  polygon: {
    owners: ["0xf89d7b9c864f589bbf53a82105107622b35eaa40", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A"],
  },
  arbitrum: {
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A", "0x88a1493366d48225fc3cefbdae9ebb23e323ade3"],
  },
  avax: {
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A", "0x88a1493366d48225fc3cefbdae9ebb23e323ade3"],
  },
  ripple: {
    owners: [
      "rMvCasZ9cohYrSZRNYPTZfoaaSUQMfgQ8G",
      "rwBHqnCgNRnk3Kyoc6zon6Wt4Wujj3HNGe",
      "raQxZLtqurEXvH5sgijrif7yXMNwvFRkJN",
      "raBWjPDjohBGc9dR6ti3DsP9Sn47jirTi3"
    ],
  },
  optimism: {
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A", "0x88a1493366d48225fc3cefbdae9ebb23e323ade3"],
  },
  era: {
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A"],
  },
  solana: {
    owners: [
      "AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2",
      "42brAgAVNzMBP7aaktPvAmBSPEkehnFQejiZc53EpJFd",
      "Hvkm4H2Ta3L3ssWbB5jeC4kpEJDuZnZqapAXp1V7UHEw",
    ],
  },
  cardano: {
    owners: ["addr1v8mn6dmk7tf9u26kr09a05lmvc9j4k9d940a88ta3hdczqgyt7whl"],
  },
  aptos: {
    owners: [
      "0x84b1675891d370d5de8f169031f9c3116d7add256ecf50a4bc71e3135ddba6e0",
    ],
  },
  taiko: {
    owners: [
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    ],
  },
  celo: {
    owners: [
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    ],
  },
  base: {
    owners: [
      "0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4",
      "0xbaed383ede0e5d9d72430661f3285daa77e9439f",
      "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A",
      "0x88a1493366d48225fc3cefbdae9ebb23e323ade3",
    ],
  },
  fantom: {
    owners: [
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    ],
  },
  kava: {
    owners: [
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    ],
  },
  linea: {
    owners: [
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    ],
  },
  litecoin: {
    owners: [
      "LKxNtynH2GxLc2oLxUGL6ryckK8JMdP5BR",
      "ltc1qp7cnlxmz8wgc93g0m020ckru2s55t25y3wunf6"
    ],
  },
  manta: {
    owners: [
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
      "0xa6a9f45518881a788e29f82a032f9d400177d2b6",
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
      "0x588846213a30fd36244e0ae0ebb2374516da836c"
    ],
  },
  scroll: {
    owners: [
      "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    ],
  },
  polkadot: {
    owners: [
      "11yLs2qzU15AhxnH1d7Koqcf83AwutKkDaGbqsJJ6yDWQjc",
      "12nr7GiDrYHzAYT9L8HdeXnMfWcBuYfAXpgfzf3upujeCciz"
    ],
  },
  eos: {
    owners: [
      "coldcrazycat",
      "eosdididada3",
      "kcwo3rimcnqf"
    ],
  },
  starknet: {
    owners: [
      "0x076601136372fcdbbd914eea797082f7504f828e122288ad45748b0c8b0c9696"
    ],
  },
  arbitrum_nova: { owners: ['0xf89d7b9c864f589bbF53a82105107622B35EaA40'] },
  mantle: { owners: ['0x588846213a30fd36244e0ae0ebb2374516da836c', '0xEe6281d94Fed46A90379F2033B6BbdcDa4EF462E'] },
  cosmos: {
    owners: [
      'cosmos17kvae2jckzpkct78yealre3ms2gu28cdmtwsv7',
      'cosmos1pyarvcy2ehrw86rcvfun34gyu2dlunnthvkc83',
    ]
  },
  doge: {
    owners: [
      'D94tDRhr4X9Tjgr8MG1Nrd5ARpesPAM7ZB',
      'DDz1H7AcqPgmKzFEP3pBHW5b1GWuWEoAAP',
    ]
  },
  ton: {
    owners: [
      'EQB9Ez1OQlyOAN4BVROkTmbm0WOyHnFyCux1eZZeXeKMVV6_',
      'EQBKHCC8mm-SlPdfHIen84OotzpIOi5tyzYw3b54s8ytANhS',
    ]
  },
  dydx: { owners: ['dydx10sdnqxvrwe3mhducn6plyewul84edgd47rfnfe'] },
};

module.exports = cexExports(config);
