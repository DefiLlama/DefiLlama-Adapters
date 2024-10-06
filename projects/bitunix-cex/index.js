const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x76B0aB5067B3be922ef4698390Ca8bd5812A5080"
    ],
  },
  bitcoin: {
    owners: [
        "bc1qxh9ruwejxz7ztzxejafd74tyxg4sgfeqxun42f",
        "bc1qhjfnumgcsqsx6grxa7mfl7rr5g3u8xl4gtt7tr",
        "bc1qkvrddql6hh00apslzsxnysl75hhnm5fpqdah37"
    ],
  },
  tron: {
    owners: [
        "TJwMqVoy8kAtrC1GLqRuoDqPYCsbaxZzw4",
        "TA2EWrSzZHsDBn3d8j4m9f2nbHds2cSNYb",
        "TNuHnKVFW3kahz3Xe6EyHJiTm9GBtg2aGD",
        "TMiru9N4RffN3e7oT1HGk8cN6WizmL4ijP",
        "TDpDGvfxtEdq7EHyHThYtSuL9tAEZSnjv7",
        "TPssYpQm3tFzQNvCSVkeTrx4cFft43Ln2J",
        "TDzTcjvucTPgZqaVjTct65AyFxP7DnLEjY",
        "TE9oPgFeo3qz3152e2GNfKEdEs3UF42jTF",
        "TYVAHVXixkL2dnaPfyjZz6J7hF6J4WW3Qx",
        "TCxBM3QPZCebzCuXtzzBA7Vet5mCcruHdN",
        "TLnMjGrgWTZLadqNRzbQPTzDPWbH6Dc1HA",
        "TRcvGsNpzkm8LdhLYmqBWESRrTUv7BPQ8t",
        "TWJ6R2EbFC5KdZFwLNj9GDiENn7WyAUjQE",
        'TJqCunxn9xYtnXtP8v5t54W7uR2huUbFvS',
        'THY84dJ4EPsPddwJP2URsqkDzHwVB9uk48',
        'TQTn7XQmZ9p2jToTV2rPbrVLZSftaZjK9y',
        'TLvpkJy9cn695PZLU2fEKYbfVDDpUymZvR',
        'TGmri3M7L5bhMVZdEViUX9tdARpJ4ANdNb',
        'TQTgNHaHLPEcCsvfFciriXLvQDktWNQ7yM',
        'TVaRQRPJh3MT3AfGLVZuaTdJL8nd176tpB',
        'TXP66hCnRzRP4ZNbQcNSWcBV4C5JnHK51F',
        'TP5UzNzk4tL2Jo6twHavUM9s9NjUPSgrvN',
        'TJRkfdgdQTSTmfQQzFy8RR6o73eLCEorSH'
    ],
  },
}

module.exports = cexExports(config)