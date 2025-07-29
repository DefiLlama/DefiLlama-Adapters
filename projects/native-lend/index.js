const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Gets all the assets deposited by LPs in Native Credit Pool for PMMs to facilitate trades for Native Swap.",
};

const config = {
  ethereum: {
    vault: "0xe3D41d19564922C9952f692C5Dd0563030f5f2EF",
    vaultFromBlock: 22173196,
  },
  bsc: {
    vault: "0xBA8dB0CAf781cAc69b6acf6C848aC148264Cc05d",
    vaultFromBlock: 47980948,
  },
  base: {
    vault: "0x097534f09EB81Cc5B69aDF36df3d3fA11b7FE1B1",
    vaultFromBlock: 28407972,
  },
  arbitrum: {
    vault: "0x273EcF5BDac92bae19ea2B525EA99F54108F03bd",
    vaultFromBlock: 355259594,
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