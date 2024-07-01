const abi = require("./abi.json");
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

// Firm
const firmStart = 16159015;
const DBR = "0xAD038Eb671c44b853887A7E32528FaB35dC5D710";

async function getMarketsFromLogs(api) {
  const logs = await getLogs({
    api,
    target: DBR,
    topics: [
      "0xc3dfb88ee5301cecf05761fb2728064e5b641524346ae69b9ba80394631bf11f",
    ],
    fromBlock: firmStart,
    eventAbi: abi.AddMarket,
    extraKey: "fix-firm",
  });

  return [...new Set(logs.map((i) => i.args.market))];
}

async function createTvlFunction(api, markets) {
  const escrows = (
    await Promise.all(
      markets.map(async (market) => {
        const logs = await getLogs({
          api,
          target: market,
          topic: "CreateEscrow(address,address)",
          fromBlock: firmStart,
          eventAbi: abi.CreateEscrow,
        });
        return logs.map((log) => log.args.escrow);
      })
    )
  ).flat();

  const tokens = await api.multiCall({ abi: "address:token", calls: escrows });
  const tokenBalances = await api.multiCall({
    abi: "uint256:balance",
    calls: escrows,
  });
  const balances = {};
  tokens.forEach((t, i) => {
    sdk.util.sumSingleBalance(balances, t, tokenBalances[i]);
  });

  return balances;
}

async function createBorrowedFunction(api, markets) {
  const DOLA = "0x865377367054516e17014CcdED1e7d814EDC9ce4";
  const tokenDebtBalances = await api.multiCall({
    abi: "function totalDebt() view returns (uint256)",
    calls: markets,
  });

  let totalBalance = tokenDebtBalances.reduce((acc, balance) => {
    return acc + parseFloat(balance);
  }, 0);

  const balances = {
    [DOLA]: totalBalance.toString(),
  };

  return balances;
}

async function getDatas(api) {
  const markets = await getMarketsFromLogs(api);
  const [tvl, borrowed] = await Promise.all([
    createTvlFunction(api, markets),
    createBorrowedFunction(api, markets),
  ]);

  return { tvl, borrowed };
}

module.exports = {
  methodology: "Get collateral balances from users personal escrows",
  hallmarks: [
    [1696204800, "Borrow against INV on FiRM"],
    [1707177600, "Launch of sDOLA"],
    [1718236800, "CRV liquidation"],
  ],
  start: 1670701200, // Dec 10 2022
  ethereum: {
    tvl: async (api) => (await getDatas(api)).tvl,
    borrowed: async (api) => (await getDatas(api)).borrowed,
  },
};
