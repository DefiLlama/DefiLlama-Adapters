const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { getFixBalancesSync } = require("../helper/portedTokens");
const lockerFactoryAbi = require("./lockerFactoryAbi.json");

const lockerFactories = new Map([
  ["ethereum", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["bsc", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["polygon", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["avax", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["arbitrum", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["cro", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["ftm", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["telos", "0x269D4d211CBc9845B006128717eE51b0D6524955"],
  ["one", "0x097f5E933306ad0EbB1c0027B223a3dd153520BE"],
]);

function getAbiByName(name) {
  return lockerFactoryAbi.find((abi) => abi.name === name);
}

function splitTokens(tokens) {
  return tokens.reduce(
    (acc, token) => {
      token.lockerAddresses.forEach((locker) => {
        acc[0].push(token.tokenAddress);
        acc[1].push(locker);
      });

      return acc;
    },
    [[], []]
  );
}

async function getTokens({ isLp, network, api }) {
  const result = await api.call({
    abi: getAbiByName("getTokens"),
    target: lockerFactories.get(network),
    params: [
      isLp,
      0,
      Number.MAX_SAFE_INTEGER - 1,
      "0x0000000000000000000000000000000000000000",
    ],
  });

  return result.pageTokens;
}

function tvlByNetwork(network) {
  return async function tvl(_, _1, _2, { api }) {
    const pageTokens = await getTokens({ isLp: false, network, api });

    const [tokens, lockers] = splitTokens(pageTokens);

    const balances = await api.multiCall({
      calls: tokens.map((token, i) => ({
        target: token,
        params: [lockers[i]],
      })),
      abi: "erc20:balanceOf",
    });

    api.addTokens(tokens, balances);
  };
}

function poolByNetwork(network) {
  return async function pool2(_, _1, _2, { api }) {
    const pageTokens = await getTokens({ isLp: true, network, api });

    const [lpTokens, lockers] = splitTokens(pageTokens);

    const chain = api.chain;
    const block = api.block;
    const balances = {};
    const transform = (addr) => `${chain}:${addr}`;

    await sumTokensAndLPsSharedOwners(
      balances,
      lpTokens.map((token) => [token, true]),
      lockers,
      block,
      chain,
      transform
    );
    const fixBalances = getFixBalancesSync(chain);
    fixBalances(balances);
    return balances;
  };
}

module.exports = {
  tvlByNetwork,
  poolByNetwork,
};
