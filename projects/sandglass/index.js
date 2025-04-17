const { sumTokens2, } = require('../helper/solana')

const tokensAndOwners = {
  eclipse: [
    ["A8uPGauLyDTw9dMjBpb9Vrgq7frbWX46XqX71paW4pri", "GGgv3ixpQjpuHL7GeLedEHHVSq6BMKmRk5RckTwvmgka"]
  ],
  solana: [
    ["EAsRTTRK2wjte4DecPYUjieTkakqFEYe9WD8z2mqvwS8", "GeXibGhHiCPvtJKCGEKWHnHvGnk1tT3VfzYz8s5G3v4y"],
    ["2Pepgww4TndN5QsvodbyjVCjUEcmPnxzq5dqsbmdtQdT", "uy1xw2f23GipDh3aL8rVWmtPLbaetwiS1uzm9RAUeTy"],
    ["89dkr9ZhU3TGNzMKF7WbbuNBaqaGEgjtWsE33Vi3RBxY", "CwaUu6mzhTtv8T3777akAQEw57eCrHWcFShsKHq4xUod"],
    ["AM8LKTfzZ5KUxviB7faYh5kFdnJhWgGVoRrZpfmi37ms", "DTf16ohumTwptoevUGuo5qZvsgibrgnefb6inBZdqDLo"],
    ["FMDHLQDh9gWnnZQN9CYNViau7D9M4ggpFMqk8uybPttc", "6975bo5KMwc7iHJy6yfnxL4HYo9SVSudTAPNM23pnPGA"],
    ["5cPbK3BdrUVMUoe2wXppLH32tu5WFzW4cxjfLKsrF3yx", "gcsAMVGbQEwXB3a6Y1gProbV6hqnMr3t6Q9Z4PVUQfY"],
    ["3Kwsdqgxp5c6yQQLVU3L6LC9LWThwvPr1urwc9UhqH2P", "DL5iykebZDbQhiCXHcsbyPaqeWAZLQQENCZsrpMYTt8c"],
    ["4LJni8SefGqyHWEdk2W8uLWaVL5uA8pfE6MkYvmMmTfF", "JosCLY7dMXJFxjwj1sGArmDSKosAVzhKDHmwdsZBe2K"],
    ["5386v6tbgEMrA5sX5sLGYTEAjpZ5fsMaLDkBbxawnnqD", "A1CfHVTRh8SqGmtUSTzUrXKzJaAroaRxs5sa5pdY4Gdw"],
    ["D637bg2p2UqPrh3gsm9r2RrBnFezeUt5qspQuJyrBFaN", "FKXrRSwG2ugEt1waao9P6UbnCZyNiBwHDj8m4nLfdteq"],
    ["FVfGSJ6VGwpbfUEjpMs6rHE8mXaLrUi5ByPR66MsQqKs", "Cz45WXUuz4xs2dGXcqDafFUEkddMs9TspLTYbaxauYzw"],
    ["9RSDq7sd7VZygdDAH4rRuL5dWWatJEMPe5pbwGSKKhr8", "9tamB4Lu4VicC7zcPcyNwDtQJRnx1rvgXxgzkzEr5mL1"]
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
