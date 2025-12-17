const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/solana')

const tokensAndOwners = {
  eclipse: [
    ["A8uPGauLyDTw9dMjBpb9Vrgq7frbWX46XqX71paW4pri", "GGgv3ixpQjpuHL7GeLedEHHVSq6BMKmRk5RckTwvmgka"]
  ],
  solana: [
    ["EAsRTTRK2wjte4DecPYUjieTkakqFEYe9WD8z2mqvwS8", "GeXibGhHiCPvtJKCGEKWHnHvGnk1tT3VfzYz8s5G3v4y"],
    ["27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4", "uy1xw2f23GipDh3aL8rVWmtPLbaetwiS1uzm9RAUeTy"],
    ["89dkr9ZhU3TGNzMKF7WbbuNBaqaGEgjtWsE33Vi3RBxY", "CwaUu6mzhTtv8T3777akAQEw57eCrHWcFShsKHq4xUod"],
    ["kyJtowDDACsJDm2jr3VZdpCA6pZcKAaNftQwrJ8KBQP", "DTf16ohumTwptoevUGuo5qZvsgibrgnefb6inBZdqDLo"],
    [ADDRESSES.solana.bSOL, "6975bo5KMwc7iHJy6yfnxL4HYo9SVSudTAPNM23pnPGA"],
    ["kySo1nETpsZE2NWe5vj2C64mPSciH1SppmHb4XieQ7B", "gcsAMVGbQEwXB3a6Y1gProbV6hqnMr3t6Q9Z4PVUQfY"],
    ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "DL5iykebZDbQhiCXHcsbyPaqeWAZLQQENCZsrpMYTt8c"],
    ["4LJni8SefGqyHWEdk2W8uLWaVL5uA8pfE6MkYvmMmTfF", "JosCLY7dMXJFxjwj1sGArmDSKosAVzhKDHmwdsZBe2K"],
    ["4tARAT4ssRYhrENCTxxZrmjL741eE2G23Q1zLPDW2ipf", "A1CfHVTRh8SqGmtUSTzUrXKzJaAroaRxs5sa5pdY4Gdw"],
    ["D637bg2p2UqPrh3gsm9r2RrBnFezeUt5qspQuJyrBFaN", "FKXrRSwG2ugEt1waao9P6UbnCZyNiBwHDj8m4nLfdteq"],
    ["2RxduzB4xWZRBm5PpdBZmDfVbGFiGD2BJcGSaVZ3tQ8K", "Cz45WXUuz4xs2dGXcqDafFUEkddMs9TspLTYbaxauYzw"],
    [ADDRESSES.solana.JitoSOL, "9tamB4Lu4VicC7zcPcyNwDtQJRnx1rvgXxgzkzEr5mL1"],
    ["CETES7CKqqKQizuSN6iWQwmTeFRjbJR6Vw2XRKfEDR8f", "6FtYGDfxQwrh2sHNGkTsirKx5vjxSeD8inwTDtPcipEd"],
    ["WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U", "7BRGGfv2dRDRVkUAo8y3M2nLvwRwvVEtx3siikooRDVw"],
    ["WFRGJnQt5pK8Dv4cDAbrSsgPcmboysrmX3RYhmRRyTR", "3XGavdreqzWoa5kw3tUT7UpPmF3yACsF5GeyTtzzxJ8v"],
    ["CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s", "DQckbqNQBsF2BusNYwFpb4BFoPJC7VeAmM4ZudHAwebn"],
    ["NUZ3FDWTtN5SP72BsefbsqpnbAY5oe21LE8bCSkqsEK", "H55YhH1arcF2pBPmuKbVdTvRVXUyD4L3jzjY2n1Nt7Lp"],
    ["kySo1nETpsZE2NWe5vj2C64mPSciH1SppmHb4XieQ7B", "x4bUfTYz26hyJNSZEB3AHSw2FT8vtjvo6hLBaXvFgYn"],
    ["kyJtowDDACsJDm2jr3VZdpCA6pZcKAaNftQwrJ8KBQP", "2CipgvXpArFUgCNZu5fruLDBETkEHP55HhtJkxfHcRz9"],
    ["4yCLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj", "GQGrpNViwB8LQ3UvJ3tArtBYZtYrZswZVKdkpKm5mcv1"]
  ]
}

async function tvl(api) {
  return sumTokens2({ tokensAndOwners: tokensAndOwners[api.chain], api, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
  eclipse: { tvl, },
}
