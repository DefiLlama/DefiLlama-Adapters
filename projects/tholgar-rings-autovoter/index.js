const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const CONFIG = {
  USD: {
    veToken: "0x0966CAE7338518961c2d35493D3EB481A75bb86B",
    token: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
    pupeeter: "0x82136B5B2FA53AEFaB8d7C87467D8e7036Bb3f72",
  },
  ETH: {
    veToken: "0x1Ec2b9a77A7226ACD457954820197F89B3E3a578",
    token: "0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812",
    pupeeter: "0x113166Ad6E99c5346aDF41d5821A6856e1510812",
  },
}

const getMarionettesLocks = async (api, tokenType) => {
  const nbMarionettes = await api.call({
    target: CONFIG[tokenType].pupeeter,
    abi: abi.currentTokenId,
  });

  const calls = [];
  for (let i = 1; i <= nbMarionettes; ++i) {
    calls.push({
      target: CONFIG[tokenType].pupeeter,
      params: [BigInt(i)],
    });
  }

  const results = await api.multiCall({
    abi: abi.getMarionette,
    calls,
    permitFailure: true,
  });

  return results
    .filter((state) => state !== null && state.veId !== null)
    .map((state) => state.veId);
}

const marionetteTvl = async (api, tokenType) => {
  const balances = {};

  const marionetteLocks = await getMarionettesLocks(api, tokenType);
  const marionetteBalances = await api.multiCall({
    abi: abi.locked,
    calls: marionetteLocks.map((lock) => ({
      target: CONFIG[tokenType].veToken,
      params: [lock],
    })),
  });
  const sum = marionetteBalances.reduce((acc, balance) => {
    return acc + BigInt(balance[0]);
  }, 0n);

  sdk.util.sumSingleBalance(
    balances,
    CONFIG[tokenType].token,
    sum,
  );
  return balances;
}

async function tvl(api,) {
  const [ethTvl, usdTvl] = await Promise.all([
    marionetteTvl(api, "ETH"),
    marionetteTvl(api, "USD"),
  ]);

  sdk.util.mergeBalances(ethTvl, usdTvl);

  return ethTvl;
}

module.exports = {
  methodology: "Counts the total veUSD and veETH locked owned by marionettes",
  sonic: {
    tvl,
  },
};
