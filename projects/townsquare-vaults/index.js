const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");

module.exports = {
  methodology: "Gets all the assets deposited by LPs in TownSquare Vault for PMMs to facilitate trades.",
};

const config = {
  monad: [
    {
      vault: "0x6B00868e2D1385b3804127827bBaB461d3E697E7",
      vaultFromBlock: 85979242,
    },
    {
      vault: "0xcD1D2D602C3e7394515DaAe96e4FFe16DE71e5B4", //we are adding additional vaults where Native is also the whitelabeler and TownSquare is the protoco
      vaultFromBlock: 70146973,
    },
  ],
};

async function getMarketTokens(api, vault, vaultFromBlock) {
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

  return { lps, tokens };
}

Object.keys(config).forEach((chain) => {
  // get all vaults for this chain
  const vaults = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      for (const { vault, vaultFromBlock } of vaults) {
        const { tokens } = await getMarketTokens(api, vault, vaultFromBlock);

        // use sumTokens2 to for cash balances in vault
        await sumTokens2({
          api,
          owner: vault,
          tokens
        });
      }

      return api.getBalances();
    },
    borrowed: async (api) => {
      const borrowedBalances = {};

      for (const { vault, vaultFromBlock } of vaults) {
        const { lps, tokens } = await getMarketTokens(api, vault, vaultFromBlock);

        // get total supplied
        let v2Locked = await api.multiCall({ abi: 'uint256:totalUnderlying', calls: lps });

        // get cash balance by reading each token balanceOf from vault
        let cashBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(token => ({ target: token, params: [vault] })) });

        // merge tokens and their corresponding locked and cash values
        const tokenData = tokens.map((token, i) => ({
          token,
          locked: BigNumber(v2Locked[i]),
          cash: BigNumber(cashBalances[i])
        }));

        // calculate borrowed amounts, summing across vaults sharing the same token
        tokenData.forEach(({ token, locked, cash }) => {
          const borrowed = locked.gt(cash) ? locked.minus(cash) : BigNumber(0);
          borrowedBalances[token] = BigNumber(borrowedBalances[token] || 0).plus(borrowed).toFixed(0);
        });
      }

      return borrowedBalances;
    },
  };
});