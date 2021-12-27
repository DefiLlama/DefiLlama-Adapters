const { getBalance, unwrapLp } = require("../helper/terra");
const { getBlock } = require("../helper/getBlock");
const utils = require("../helper/utils");

const holderToken = "terra1w6xf64nlmy3fevmmypx6w2fa34ue74hlye3chk";
const token = "terra1dy9kmlm4anr92e42mrkjwzyvfqwz66un00rwr5";

const holderlp = "terra1ude6ggsvwrhefw2dqjh4j6r7fdmu9nk6nf2z32";
const pair = "terra17fysmcl52xjrs8ldswhz7n6mt37r9cmpcguack"; // VKR-UST lp

async function staking(timestamp, chainBlocks) {
  const block = await getBlock(timestamp, "terra", chainBlocks, true);

  const price_vkr = (
    await utils.fetchURL(
      "https://api.valkyrieprotocol.com/valkyrie/price/history/30m?from=1640524205549"
    )
  ).data.data.items.map((p) => p.price);

  const tokenBalance = await getBalance(token, holderToken, block);

  return {
    terrausd: (tokenBalance * price_vkr[0]) / 1e6,
  };
}

async function pool2(timestamp, chainBlocks) {
  const ustBalances = {};
  const block = await getBlock(timestamp, "terra", chainBlocks, true);
  const balance = await getBalance(pair, holderlp, block);
  await unwrapLp(ustBalances, pair, balance, block);

  return {
    terrausd: (ustBalances.uusd * 2) / 1e6,
  };
}

module.exports = {
  terra: {
    staking: staking,
    pool2: pool2,
  },
  tvl: (tvl) => ({}),
  misrepresentedTokens: true,
  timetravel: true,
};
