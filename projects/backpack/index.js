const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

// https://dune.com/21co/backpack-exchange
const config = {
  solana: {
    owners: [
      "43DbAvKxhXh1oSxkJSqGosNw3HpBnmsWiak6tB5wpecN",
      "BbHG9GvPActFGogv3iNrpDAj4qpXr8t3jF16uGxXcKci",
      "9NJmj9VaTU9D7ytdzy5RHMrfAgw2pYwqnUhuMqatcsr",
      "HwDX5eJkzPAJ7y7ENrH23HaDGUgB4nXPxG8UsB4cEMGE",
      "HgTWrWU195u6s4v3JiEjJFCb6J6wxtQh8DAYV63tCx6Q",
      "DFFN6XgrTYDR2uFvaXJFRcFrMrtt6ZbPxpDs3mVbpxuR",
      "J16ovD5x6kZLYDYAa6CqfrwacHdM7fcKD9iKG5EoNeGR",
      "4VULyn2PoqzF6EyQ9acJqeAwg7pwmQPppM56NRJyQ1Fi",
      "5stwKMsakQkH3uzN5eQx9LKzq6N8q3DBjXzkHyvudFde",
      "J4RR6RDvCBVcwrLgCnfDkXmv9cxYtxTz5t4NPvCRMSQR",
      "FCQSFKkw2JPhpG4M18nvGfiNAK6N3gFBmp8pkn4CxYGs",
      "6wspq3nz3qPQ9X6rbLM5bEDHK525yPSNqyqeABXcSMHQ",
      "6m68XVvBR4oLCgM7YFgH1VqzzV5vk9UimvmVUvyKw6c2",
    ],
  },
  ethereum: {
    owners: [
      "0x2228e5704B637131A3798A186CAF18366c146f74",
      "0x6a3eAb9Ee70C82A2B13708041f2C5892bEa6857B",
      "0xEC8F9ef3031b0CdF05E42e0Ece8D6397F92595e8",
      "0x73ac628b14fb35d70266e96a886b8c5fe7ce22cf",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.backpack,
  },
  sui: {
    owners: [
      "0x96073f85f1d558329999e03000dba6bcf30d8b0aff26a88a9227402e87c200aa",
    ],
  },
};

module.exports = cexExports(config);
