const { cexExports } = require("../helper/cex");

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
      "0xbaed383ede0e5d9d72430661f3285daa77e9439f"
    ],
  },
  bitcoin: {
    owners: [
      "bc1q2qqqt87kh33s0er58akh7v9cwjgd83z5smh9rp",
      "bc1q9w4g79ndel72lygvwtqzem67z6uqv4yncvqjz3yn8my9swnwflxsutg4cx",
      "bc1qjysjfd9t9aspttpjqzv68k0ydpe7pvyd5vlyn37868473lell5tqkz456m",
      "1GrwDkr33gT6LuumniYjKEGjTLhsL5kmqC",
      "bc1qs5vdqkusz4v7qac8ynx0vt9jrekwuupx2fl5udp9jql3sr03z3gsr2mf0f",
      // added on the 15th of july 2024.
      "bc1qa2eu6p5rl9255e3xz7fcgm6snn4wl5kdfh7zpt05qp5fad9dmsys0qjg0e",
      "16jVbMCcqq1deKrMB3esL2HPso7kvqUsec"
    ],
  },
  bsc: {
    owners: [
      "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A",
      "0xf89d7b9c864f589bbf53a82105107622b35eaa40",
      "0x88a1493366d48225fc3cefbdae9ebb23e323ade3"
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
      "TTH75Z9rfRgzCLNDDYBaR2WjUvuSDRtSMg"
    ],
  },
  polygon: {
    owners: ["0xf89d7b9c864f589bbf53a82105107622b35eaa40", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A"],
  },
  arbitrum: {
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A"],
  },
  avax: {
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A"],
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
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A"],
  },
  era: {
    owners: ["0xf89d7b9c864f589bbF53a82105107622B35EaA40", "0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4", "0xee5B5B923fFcE93A870B3104b7CA09c3db80047A"],
  },
  solana: {
    owners: [
      "AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2",
      "42brAgAVNzMBP7aaktPvAmBSPEkehnFQejiZc53EpJFd",
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
};

module.exports = cexExports(config);
