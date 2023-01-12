
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { providers } = require('@defillama/sdk/build/general');
const abi = require("./abi.json");
const ethers = require("ethers");

// Firm
const firmStart = 16159015;
const DBR = '0xAD038Eb671c44b853887A7E32528FaB35dC5D710';

const getFirmMarkets = async (dbrContract) => {
  const logs = await dbrContract.queryFilter(dbrContract.filters.AddMarket());
  return logs.map(l => l.args.market);
}

const getFirmEscrowsWithMarket = async (markets) => {
  const escrowCreations = await Promise.all(
    markets.map(m => {
      const market = new ethers.Contract(m, abi.market, providers.ethereum);
      return market.queryFilter(market.filters.CreateEscrow(), firmStart);
    })
  );

  const escrowsWithMarkets = escrowCreations.map((marketEscrows, marketIndex) => {
    const market = markets[marketIndex];
    return marketEscrows.map(escrowCreationEvent => {
      return { escrow: escrowCreationEvent.args[1], market }
    })
  }).flat();

  return escrowsWithMarkets;
}

async function tvl(timestamp, block) {
  const balances = {};

  const dbrContract = new ethers.Contract(DBR, abi.dbr, providers.ethereum);
  const markets = await getFirmMarkets(dbrContract);
  const escrowsWithMarkets = await getFirmEscrowsWithMarket(markets);

  let allBalances = (
    await sdk.api.abi.multiCall({
      block,
      calls: escrowsWithMarkets.map(
        (em) => ({
          target: em.escrow,
        })
      ),
      abi: abi["balance"],
    })
  ).output;

  let allUnderlying = (
    await sdk.api.abi.multiCall({
      block,
      calls: markets.map(
        (m) => ({
          target: m,
        })
      ),
      abi: abi["collateral"],
    })
  ).output;

  allBalances.map((b,i) => {
    const market = escrowsWithMarkets[i].market;
    const underlying = allUnderlying.find(u => u.input.target === market).output;
    if(!balances[underlying]){
      balances[underlying] = BigNumber(0);
    }
    balances[underlying] = balances[underlying].plus(b.output);
  })

  return balances;
}

module.exports = {
  methodology: "Get collateral balances from users personal escrows",
  hallmarks: [],
  start: 1670701200, // Dec 10 2022
  ethereum: { tvl }
};
