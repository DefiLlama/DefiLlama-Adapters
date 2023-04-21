const sdk = require("@defillama/sdk");
const { getConfig } = require("./utils");

const ethAddress = "0x0000000000000000000000000000000000000000";

async function tvl(_, _1, _2, api) {
  const balances = {};

  const url =
    "https://raw.githubusercontent.com/UMAprotocol/protocol/main/packages/core/config/adapters/defiLlama/oSnap.json";
  const config = await getConfig(url);

  const { tokens, avatars } = config[api.chain];

  await Promise.all(
    avatars.map(async (avatar) => {
      // eth balance
      const { output: balance } = await sdk.api.eth.getBalance({
        target: avatar,
        block: api.block,
      });
      await sdk.util.sumSingleBalance(balances, ethAddress, balance);

      // erc20 balances
      await Promise.all(
        tokens.map(async (token) => {
          const balance = await api.api.call({
            abi: "erc20:balanceOf",
            target: token,
            params: [avatar],
          });
          await sdk.util.sumSingleBalance(balances, token, balance, api.chain);
        })
      );
    })
  );

  return balances;
}

module.exports = {
  methodology:
    "Calculates the total value held by the Avatars of all deployed OGs modules",
  ethereum: {
    tvl,
  },
  polygon: {
    tvl,
  },
  avax: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  optimism: {
    tvl,
  },
  xdai: {
    tvl,
  },
};
