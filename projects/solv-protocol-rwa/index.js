const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");
const abi = require("./abi.json");
const { cachedGraphQuery } = require("../helper/cache");

// The Graph
const graphUrlList = {
  mantle: 'http://api.0xgraph.xyz/subgraphs/name/solv-payable-factory-mentle-0xgraph',
}

const slotListUrl = 'https://cdn.jsdelivr.net/gh/solv-finance-dev/solv-protocol-rwa-slot/slot.json';


async function tvl(api) {
  const network = api.chain;
  const pools = await getGraphData(api.timestamp, network, api);
  if (pools == undefined || pools.length === 0) return {}
  const poolConcretes = await concrete(pools, api);
  const nav = await api.multiCall({
    abi: abi.getSubscribeNav,
    calls: pools.map((index) => ({
      target: index.navOracle,
      params: [index.poolId, api.timestamp]
    })),
  })

  const poolTotalValues = await api.multiCall({
    abi: abi.slotTotalValue,
    calls: pools.map((index) => ({
      target: poolConcretes[index.contractAddress],
      params: [index.openFundShareSlot]
    })),
  })

  const poolBaseInfos = await api.multiCall({
    abi: abi.slotBaseInfo,
    calls: pools.map((index) => ({
      target: poolConcretes[index.contractAddress],
      params: [index.openFundShareSlot]
    })),
  })

  const poolDecimalList = await api.multiCall({
    abi: abi.decimals,
    calls: poolBaseInfos.map(i => i[1]),
  })

  for (let i = 0; i < poolTotalValues.length; i++) {
    const decimals = poolDecimalList[i];
    const balance = BigNumber(poolTotalValues[i]).div(BigNumber(10).pow(18 - decimals)).times(BigNumber(nav[i].nav_).div(BigNumber(10).pow(decimals))).toNumber();
    api.add(poolBaseInfos[i][1], balance)
  }
  return api.getBalances()
}

async function concrete(slots, api) {
  var slotsList = [];
  var only = {};
  for (var i = 0; i < slots.length; i++) {
    if (!only[slots[i].contractAddress]) {
      slotsList.push(slots[i]);
      only[slots[i].contractAddress] = true;
    }
  }

  const concreteLists = await api.multiCall({
    calls: slotsList.map((index) => index.contractAddress),
    abi: abi.concrete,
  })

  let concretes = {};
  for (var k = 0; k < concreteLists.length; k++) {
    concretes[slotsList[k].contractAddress] = concreteLists[k];
  }

  return concretes;
}

async function getGraphData(timestamp, chain, api) {
  let rwaSlot = (await getConfig('solv-protocol/slots', slotListUrl));

  const slotDataQuery = `query BondSlotInfos {
            poolOrderInfos(first: 1000,  where:{fundraisingEndTime_gt:${timestamp}, openFundShareSlot_in:${JSON.stringify(rwaSlot)}}) {
              marketContractAddress
              contractAddress
              navOracle
              poolId
              openFundShareSlot
          }
        }`;
  const data = (await cachedGraphQuery(`solv-protocol/rwa-graph-data/${chain}`, graphUrlList[chain], slotDataQuery, { api,  }));
  return data.poolOrderInfos;
}
// node test.js projects/solv-protocol-rwa
['mantle'].forEach(chain => {
  module.exports[chain] = { tvl }
})