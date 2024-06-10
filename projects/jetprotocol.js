const ADDRESSES = require('./helper/coreAssets.json')
const { getTokenBalance, sumTokens2 } = require("./helper/solana");

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
  return sumTokens2({ owner: '7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8', tokens: [
    ADDRESSES.solana.USDC,
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    ADDRESSES.solana.SOL,
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
  ]});
}

// JPv1rCqrhagNNmJVM5J1he7msQ5ybtvE1nNuHpDHMNU
// https://docs.jetprotocol.io/jet-protocol/protocol/smart-contracts
module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
  hallmarks: [
    [Math.floor(new Date('2023-12-12')/1e3), 'Jet Protocol Holdings, LLC is shutting down'], // https://forum.jetprotocol.io/t/community-update-jet-protocol-holdings-llc-is-shutting-down/1560/21
  ],
};
