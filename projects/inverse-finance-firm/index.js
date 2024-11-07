
const abi = require("./abi.json");
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk")

// Firm
const firmStart = 16159015;
const DBR = '0xAD038Eb671c44b853887A7E32528FaB35dC5D710';
const DOLA = '0x865377367054516e17014CcdED1e7d814EDC9ce4';

async function getMarketAddresses (api) {
  const logs = await getLogs({
    api,
    target: DBR,
    topics: ['0xc3dfb88ee5301cecf05761fb2728064e5b641524346ae69b9ba80394631bf11f'],
    fromBlock: firmStart,
    eventAbi: abi.AddMarket,
    extraKey: "fix-firm"
  })
  
  // unique markets
  return [...new Set(logs.map(i => i.args.market))];
}

async function tvl(api) {
  const markets = await getMarketAddresses(api);

  let escrows = await Promise.all(
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
  escrows = escrows.flat()
  const tokens = await api.multiCall({  abi: 'address:token', calls: escrows})
  const tokenBalances = await api.multiCall({  abi: 'uint256:balance', calls: escrows})
  const balances = {}
  tokens.forEach((t,i)=>{
    sdk.util.sumSingleBalance(balances, t, tokenBalances[i])
  })
  return balances
}

async function borrowed(api) {
  const markets = await getMarketAddresses(api);

  const marketDebts = await api.multiCall({  abi: 'uint256:totalDebt', calls: markets})
  const balances = {}
  marketDebts.forEach((t,i)=>{
    sdk.util.sumSingleBalance(balances, DOLA, marketDebts[i])
  })
  return balances
}

module.exports = {
  methodology: "Get collateral balances from users personal escrows",
  hallmarks: [    
    [1696204800, "Borrow against INV on FiRM"],
    [1707177600, "Launch of sDOLA"],
    [1718236800, "CRV liquidation"]    
  ],
  start: 1670701200, // Dec 10 2022
  ethereum: { 
    tvl,
    borrowed,
   }
};
