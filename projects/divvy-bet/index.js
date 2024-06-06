const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({
    tokensAndOwners: [
      [
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        "GBgg4DxDAx18zjTbdfv1LgdX5VNGprKomeDyRJrQYX3t",
      ],
      [
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
        "HXjwCrCKWR6EyrVYSUPcFfnPitWKy2xLhasE9Ak4BdxY",
      ],
      [
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // Bonk
        "5oqHf5xbaV5hTUXFaadMu8SPkE4QLWPh661WHYyek58t",
      ],
      [
        "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // Jupiter
        "8zYNQCVLdnCX8ZhtNagCR3m71cERVB6Z66eGprTqRFUg",
      ],
      [
        "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ", // Wormhole
        "DQBQnAQBRQUh4jufHVoWkr62BLDFbePDZRHc2txhdM8h",
      ],
      [
        "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", // PYTH
        "4tm991TMpgVh5ABzm1VG1AxxvdcBviis9PHEFhyri97J",
      ],
    ],
    solOwners: ["B98A4BxgrpmkXvKHSFyYPwp3GqrmFBN7Na1vCwtPDfvd"],
  });
}

module.exports = {
  timetravel: false,
  solana: { tvl },
};
