const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4', 
       '0xA7A93fd0a276fc1C0197a5B5623eD117786eeD06',
       '0xe1ab8c08294F8ee707D4eFa458eaB8BbEeB09215',
       '0xee5B5B923fFcE93A870B3104b7CA09c3db80047A',
       '0xf89d7b9c864f589bbF53a82105107622B35EaA40', // multiple chains
    ],
  },
  bitcoin: {
    owners: [
        'bc1q2qqqt87kh33s0er58akh7v9cwjgd83z5smh9rp',
        'bc1q9w4g79ndel72lygvwtqzem67z6uqv4yncvqjz3yn8my9swnwflxsutg4cx',
        'bc1qjysjfd9t9aspttpjqzv68k0ydpe7pvyd5vlyn37868473lell5tqkz456m',
        '1GrwDkr33gT6LuumniYjKEGjTLhsL5kmqC',
        'bc1qs5vdqkusz4v7qac8ynx0vt9jrekwuupx2fl5udp9jql3sr03z3gsr2mf0f',
        // added on the 15th of july 2024.
        'bc1qa2eu6p5rl9255e3xz7fcgm6snn4wl5kdfh7zpt05qp5fad9dmsys0qjg0e'
           ]
  },
  bsc: {
    owners: [
        '0xee5B5B923fFcE93A870B3104b7CA09c3db80047A',
        '0xf89d7b9c864f589bbf53a82105107622b35eaa40',
    ]
  },
  tron: {
    owners: [
        'TB1WQmj63bHV9Qmuhp39WABzutphMAetSc',
        'TBpr1tQ5kvoKMv85XsCESVavYo4oZZdWpY',
        'TKFvdC4UC1vtCoHZgn8eviK34kormXaqJ7',
        'TQVxjVy2sYt4at45ezD7VG4H6nQZtsua5C',
        'TS9PDCB6vzLYDCPr5Nas2yzekdr7ot6dxn',
        'TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa',
        'TXRRpT4BZ3dB5ShUQew2HXv1iK3Gg4MM9j',
        'TYgFxMvvu2VHFJnxQf8fh1qVAeMfXZJZ3K',
    ]
  },
  polygon: {
    owners: ['0xf89d7b9c864f589bbf53a82105107622b35eaa40']
  },
  arbitrum: {
    owners: ['0xf89d7b9c864f589bbF53a82105107622B35EaA40']
  },
  avax: {
    owners: ['0xf89d7b9c864f589bbF53a82105107622B35EaA40']
  },
  ripple: {
    owners: [
        'rMvCasZ9cohYrSZRNYPTZfoaaSUQMfgQ8G',
        'rwBHqnCgNRnk3Kyoc6zon6Wt4Wujj3HNGe',
        'raQxZLtqurEXvH5sgijrif7yXMNwvFRkJN'
    ]
  },
  optimism: {
    owners: ['0xf89d7b9c864f589bbF53a82105107622B35EaA40']
  },
  era: {
    owners: ['0xf89d7b9c864f589bbF53a82105107622B35EaA40']
  },
  solana: {
    owners: [
      'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
      '42brAgAVNzMBP7aaktPvAmBSPEkehnFQejiZc53EpJFd'
     ]
  },
  cardano: {
    owners: ['addr1v8mn6dmk7tf9u26kr09a05lmvc9j4k9d940a88ta3hdczqgyt7whl']
   }
}

module.exports = cexExports(config)