const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens2 } = require("./helper/solana");

const debtMapping = {
  'G17Yu6f4emBeRLWS1Y4cNJMTmT5LUGJH95zK6253KoAH': ADDRESSES.solana.USDC,
  '5v8QVtwqZjSdJxhCF2xWrAopiyhDgJTdgeQZ5aWmStnE': '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
  'A9S9XVCuNXHnJGFhxBhsTmJNHa6aPccF5NCAGgE4BxGF': ADDRESSES.solana.SOL,
  '7SXpzVgqMvDEWkv9jtDUZVjkBPUbn8EUitKwV22WCpxt': '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
}

async function borrowed(api) {
  const allBals = await sumTokens2({ owner: '7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8', })
  
  Object.entries(debtMapping).forEach(([key, value]) => {
    api.add(value, allBals['solana:'+key] ?? 0)
  })
}

async function tvl() {
  return sumTokens2({ owner: '7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8', blacklistedTokens: Object.keys(debtMapping)});
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
    ['2023-12-12', 'Jet Protocol Holdings, LLC is shutting down'], // https://forum.jetprotocol.io/t/community-update-jet-protocol-holdings-llc-is-shutting-down/1560/21
  ],
};
