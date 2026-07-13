const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

// This vault is curated by Native but whitelabeled/owned by TownSquare on monad,
// so it is also tracked in projects/townsquare-vaults. Marked doublecounted here
// to avoid inflating aggregate TVL sums across both adapters.
module.exports = {
  doublecounted: true,
  methodology: "Gets all the assets deposited by LPs in the Native-curated, TownSquare-owned Credit Pool on monad for PMMs to facilitate trades for Native Swap.",
};

const config = {
  monad: {
    vault: "0xcD1D2D602C3e7394515DaAe96e4FFe16DE71e5B4",
    vaultFromBlock: 70146973,
  },
};

Object.keys(config).forEach((chain) => {
  // get vault and start block
  const { vault, vaultFromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      // get all lps
      const lpListedLogs = await getLogs({
        api,
        target: vault,
        topic: "MarketListed(address)",
        eventAbi:
          "event MarketListed(address lpToken)",
        onlyArgs: true,
        fromBlock: vaultFromBlock,
      });
      const lps = lpListedLogs.map((i) => i.lpToken);

      // get all underlying tokens
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: lps });

      // use sumTokens2 to for cash balances in vault
      return sumTokens2({
        api,
        owner: vault,
        tokens
      });
    },
    borrowed: async (api) => {
      // get all lps
      const lpListedLogs = await getLogs({
        api,
        target: vault,
        topic: "MarketListed(address)",
        eventAbi:
          "event MarketListed(address lpToken)",
        onlyArgs: true,
        fromBlock: vaultFromBlock,
      });
      const lps = lpListedLogs.map((i) => i.lpToken);

      // get all underlying tokens
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: lps });

      // get total supplied
      let v2Locked = await api.multiCall({ abi: 'address:totalUnderlying', calls: lps });

      // get cash balance by reading each token balanceOf from vault
      let cashBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(token => ({ target: token, params: [vault] })) });

      // merge tokens and their corresponding locked and cash values
      const tokenData = tokens.map((token, i) => ({
        token,
        locked: parseInt(v2Locked[i]),
        cash: parseInt(cashBalances[i])
      }));

      // calculate borrowed amounts
      const borrowedBalances = {};
      tokenData.forEach(({ token, locked, cash }) => {
        if (locked > cash) {
          borrowedBalances[token] = locked - cash;
        } else {
          borrowedBalances[token] = 0;
        }
      });

      return borrowedBalances;
    },
  };
});
