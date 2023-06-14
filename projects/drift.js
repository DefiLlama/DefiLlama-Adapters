const { sumTokens2 } = require('./helper/solana')

async function tvl() {
  // token account authority: JCNCMFXo5M5qwUPg2Utu1u6YWp3MbygxqBsBeXXJfrw
  return sumTokens2({
    tokenAccounts: [
      '6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S', // legacy usdc vault
      'Bzjkrm1bFwVXUaV9HTnwxFrPtNso7dnwPQamhqSxtuhZ', // usdc insurance fund
      'GXWqPpjQpdz7KZw9p7f5PX2eGxHAhvpNXiviFkAB8zXg', // usdc vault
      'DfYCNezifxAEsQbAJ1b3j6PX3JVBe8fu11KBhxsbw5d2', // sol vault
      '4vwQWa4RjmPkn1WrmyEE3t912yWsBf9JNkASH36AQL3F', // sol insurance fund
      '5p8B6KhJjesV212heBu1o86W2vUSnW1P83ZNnMLtCAAx', // msol vault
      'iBM2BTsrXXDfwm4P4ssbzBAquaj7gGgNNhBVaq8ryiY',  // msol insurance fund
      '2CqkQvYxp9Mq4PqLvAQ1eryYxebUh4Liyn5YMDtXsYci', // legacy usdc insurance fund
    ]
  })
}

module.exports = {
  timetravel: false,
  methodology: "Calculate sum across all program token accounts",
  solana: {
    tvl
  }
}
