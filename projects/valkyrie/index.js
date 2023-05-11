const { getBalance, unwrapLp } = require("../helper/chain/terra");

const holderToken = "terra1w6xf64nlmy3fevmmypx6w2fa34ue74hlye3chk";
const token = "terra1dy9kmlm4anr92e42mrkjwzyvfqwz66un00rwr5";

const holderlp = "terra1ude6ggsvwrhefw2dqjh4j6r7fdmu9nk6nf2z32";
const pair = "terra17fysmcl52xjrs8ldswhz7n6mt37r9cmpcguack"; // VKR-UST lp

async function staking(timestamp, _, { terra: block }) {
  const tokenBalance = await getBalance(token, holderToken, block);

  return {
    "valkyrie-protocol": (tokenBalance) / 1e6,
  };
}

async function pool2(timestamp,_, { terra: block }) {
  const ustBalances = {};
  const balance = await getBalance(pair, holderlp, block);
  await unwrapLp(ustBalances, pair, balance, block);

  return {
    terrausd: (ustBalances.uusd * 2) / 1e6,
  };
}

module.exports = {
  terra: {
    tvl: () => ({}),
    staking: staking,
    pool2: pool2,
  },
  misrepresentedTokens: true,
  timetravel: true,
};
module.exports.hallmarks = [
        [1651881600, "UST depeg"],
      ]
