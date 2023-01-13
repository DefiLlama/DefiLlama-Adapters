
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getLogs } = require('../helper/cache/getLogs')

// Firm
const firmStart = 16159015;
const DBR = '0xAD038Eb671c44b853887A7E32528FaB35dC5D710';

const getFirmEscrowsWithMarket = async (markets, api) => {
  const escrowCreations = await Promise.all(
    markets.map(async m => {
      const logs = await getLogs({
        api,
        target: m,
        topic: "CreateEscrow(address,address)",
        fromBlock: firmStart,
        eventAbi: abi.CreateEscrow,
      })
      return logs.map(i => i.args.escrow)
    })
  );
  return markets.map((m, i) => escrowCreations[i].map(e => ({ escrow: e, market: m}))).flat()
}

async function tvl(timestamp, block, _, { api }) {
  const logs = await getLogs({
    api,
    target: DBR,
    topics: ['0xc3dfb88ee5301cecf05761fb2728064e5b641524346ae69b9ba80394631bf11f'],
    fromBlock: firmStart,
    eventAbi: abi.AddMarket,
  })
  
  const balances = {};

  const markets = logs.map(i => i.args.market);
  const escrowsWithMarkets = await getFirmEscrowsWithMarket(markets, api);
  const bals = await api.multiCall({  abi: abi.balance, calls: escrowsWithMarkets.map(i => i.escrow)}) 
  const collaterals = await api.multiCall({  abi: abi.collateral, calls: escrowsWithMarkets.map(i => i.market)}) 
  collaterals.map((c, i) => sdk.util.sumSingleBalance(balances,c,bals[i], api.chain))
  return balances
}

module.exports = {
  methodology: "Get collateral balances from users personal escrows",
  hallmarks: [],
  start: 1670701200, // Dec 10 2022
  ethereum: { tvl }
};
