const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");
const { cachedGraphQuery } = require("../helper/cache");

// The Graph
const graphUrlList = {
  ethereum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-prod/version/latest',
  bsc: 'https://api.thegraph.com/subgraphs/name/slov-payable/solv-v3-earn-factory',
  arbitrum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-arbitrum/version/latest',
  mantle: 'http://api.0xgraph.xyz/subgraphs/name/solv-payable-factory-mentle-0xgraph',
}

const filterSlot = [
  "24463698369598535545979799361840946803505909684060624549876546521811809090281",
  "35721610559268442584760110830641808857798079704888818123868248602816498531758",
  "71384167217207433357665203528199852676074195415546219658272700694805764131696",
  "94855382073997775269187449187472275689000980913702165029893305070390069014119"
];

async function tvl() {
  const { api } = arguments[3];
  const network = api.chain;
  const graphData = await getGraphData(api.timestamp, network, api);
  if (graphData.slots.length > 0) {
    const slots = graphData.slots;
    const closeConcretes = await concrete(slots, api);
    const closeTotalValues = await api.multiCall({
      abi: abi.slotTotalValue,
      calls: slots.map((index) => ({
        target: closeConcretes[index.contractAddress],
        params: [index.slot]
      })),
    })

    const closeBaseInfos = await api.multiCall({
      abi: abi.slotBaseInfo,
      calls: slots.map((index) => ({
        target: closeConcretes[index.contractAddress],
        params: [index.slot]
      })),
    })

    const closeDecimalList = await api.multiCall({
      abi: abi.decimals,
      calls: closeBaseInfos.map(i => i[1]),
    })

    for (let i = 0; i < closeTotalValues.length; i++) {
      const decimals = closeDecimalList[i];
      const balance = BigNumber(closeTotalValues[i]).div(BigNumber(10).pow(18 - decimals)).toNumber();
      api.add(closeBaseInfos[i][1], balance)
    }
  }

  if (graphData.pools.length > 0) {
    const pools = graphData.pools;
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
  }
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
  const slotDataQuery = `query BondSlotInfos ($block: Int){
            bondSlotInfos(first: 1000, block: { number: $block }  where:{maturity_gt:${timestamp}}) {
                contractAddress
                slot
            }
            poolOrderInfos(first: 1000, block: { number: $block }  where:{fundraisingEndTime_gt:${timestamp}}) {
              marketContractAddress
              contractAddress
              navOracle
              poolId
              openFundShareSlot
          }
        }`;
  const data = (await cachedGraphQuery(`solv-protocol/graph-data/${chain}`, graphUrlList[chain], slotDataQuery, { api, useBlock: true, }));

  let slotList = [];
  let poolList = [];
  if (data != undefined && data.bondSlotInfos != undefined) {
    for (let i = 0; i < data.bondSlotInfos.length; i++) {
      const bondSlotInfo = data.bondSlotInfos[i];
      if (filterSlot.indexOf(bondSlotInfo.slot) == -1) {
        slotList.push(bondSlotInfo)
      }
    }
  }
  if (data != undefined && data.poolOrderInfos != undefined) {
    poolList = data.poolOrderInfos;
  }
  return {
    slots: slotList,
    pools: poolList
  };
}
// node test.js projects/solv-protocol-v3
['ethereum', 'bsc', 'arbitrum', 'mantle'].forEach(chain => {
  module.exports[chain] = { tvl: () => ({}), borrowed: tvl, }
})