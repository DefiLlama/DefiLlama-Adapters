const { getTokenBalance } = require("./helper/solana");

async function borrowed() {
  const [usdcAmount, ethAmount, solAmount, btcAmount] = await Promise.all([
    getTokenBalance(
      "G17Yu6f4emBeRLWS1Y4cNJMTmT5LUGJH95zK6253KoAH",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
    getTokenBalance(
      "5v8QVtwqZjSdJxhCF2xWrAopiyhDgJTdgeQZ5aWmStnE",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
    getTokenBalance(
      "A9S9XVCuNXHnJGFhxBhsTmJNHa6aPccF5NCAGgE4BxGF",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
    getTokenBalance(
      "7SXpzVgqMvDEWkv9jtDUZVjkBPUbn8EUitKwV22WCpxt",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
  ]);
  return {
    bitcoin: btcAmount,
    "usd-coin": usdcAmount,
    ethereum: ethAmount,
    solana: solAmount,
  };
}

async function tvl() {
  const [usdcAmount, ethAmount, solAmount, btcAmount] = await Promise.all([
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
    getTokenBalance(
      "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
    getTokenBalance(
      "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
      "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"
    ),
  ]);
  return {
    bitcoin: btcAmount,
    "usd-coin": usdcAmount,
    ethereum: ethAmount,
    solana: solAmount,
  };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
};
