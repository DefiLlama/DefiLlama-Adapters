const sdk = require("@defillama/sdk");
const { getConfig } = require("./utils");

const ethAddress = "0x0000000000000000000000000000000000000000";

async function tvl(_, _1, _2, api) {
  const balances = {};

  const url =
    "https://raw.githubusercontent.com/UMAprotocol/protocol/master/packages/core/config/adapters/defiLlama/oSnap.json";
  const config = await getConfig(url);

  const { tokens, avatars } = config[api.chain];

  await Promise.all(
    avatars.map(async (avatar) => {
      const {
        excludedTokens,
        tokens: avatarTokens,
        address: avatarAddress,
      } = avatar;
      // eth balance
      const { output: balance } = await sdk.api.eth.getBalance({
        target: avatarAddress,
        block: api.block,
      });
      await sdk.util.sumSingleBalance(balances, ethAddress, balance);

      // combine avatar tokens and global tokens and remove excluded tokens
      const filteredTokens = [
        ...new Set(
          [...tokens, ...avatarTokens].filter(
            (t) => !excludedTokens.includes(t)
          )
        ),
      ];

      // erc20 balances
      await Promise.all(
        filteredTokens.map(async (token) => {
          const balance = await api.api.call({
            abi: "erc20:balanceOf",
            target: token,
            params: [avatarAddress],
          });
          await sdk.util.sumSingleBalance(balances, token, balance, api.chain);
        })
      );
    })
  );

  return balances;
}

module.exports = {
  timetravel: false,
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
