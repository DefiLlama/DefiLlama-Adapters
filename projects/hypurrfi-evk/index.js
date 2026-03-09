const { sumTokens2 } = require("../helper/unwrapLPs");

// HypurrFi EVK (Euler Vault Kit) - ERC-4626 vaults on Hyperliquid
const EVAULT_FACTORY = "0xcF5552580fD364cdBBFcB5Ae345f75674c59273A";

async function getVaults(api) {
  const vaults = await api.fetchList({
    lengthAbi: "getProxyListLength",
    itemAbi: "proxyList",
    target: EVAULT_FACTORY,
  });
  const tokens = await api.multiCall({ abi: "address:asset", calls: vaults });
  return { vaults, tokens };
}

module.exports = {
  methodology:
    "TVL is the total value of assets deposited into HypurrFi EVK (Euler Vault Kit) vaults on Hyperliquid, minus outstanding borrows.",
  hyperliquid: {
    tvl: async (api) => {
      const { vaults, tokens } = await getVaults(api);
      return sumTokens2({
        api,
        tokensAndOwners2: [tokens, vaults],
        permitFailure: true,
      });
    },
    borrowed: async (api) => {
      const { vaults, tokens } = await getVaults(api);
      const borrows = await api.multiCall({
        abi: "uint256:totalBorrows",
        calls: vaults,
      });
      api.add(tokens, borrows);
    },
  },
};
