const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");
const { cachedGraphQuery } = require("../helper/cache");

// The Graph
const graphUrlList = {
  ethereum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-prod/version/latest',
  bsc: 'https://api.thegraph.com/subgraphs/name/slov-payable/solv-v3-earn-factory',
  arbitrum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-arbitrum/version/latest',
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
  const slots = await getSlot(api.timestamp, network);
  if (slots.length <= 0) {
    return;
  }
  const concretes = await concrete(slots, api);

  const totalValues = await api.multiCall({
    abi: abi.slotTotalValue,
    calls: slots.map((index) => ({
      target: concretes[index.contractAddress],
      params: [index.slot]
    })),
  })

  const baseInfos = await api.multiCall({
    abi: abi.slotBaseInfo,
    calls: slots.map((index) => ({
      target: concretes[index.contractAddress],
      params: [index.slot]
    })),
  })

  const decimalList = await api.multiCall({
    abi: abi.decimals,
    calls: baseInfos.map(i => i[1]),
  })

  for (let i = 0; i < totalValues.length; i++) {
    const decimals = decimalList[i];
    const balance = BigNumber(totalValues[i]).div(BigNumber(10).pow(18 - decimals)).toNumber();
    api.add(baseInfos[i][1], balance)
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


async function getSlot(timestamp, chain) {
  const slotDataQuery = `query BondSlotInfos {
            bondSlotInfos(first: 1000, where:{maturity_gt:${timestamp}}) {
                contractAddress
                slot
            }
        }`;
  const slots = (await cachedGraphQuery(`solv-protocol/graph-data/${chain}`, graphUrlList[chain], slotDataQuery)).bondSlotInfos;
  let slotList = [];
  for (let i = 0; i < slots.length; i++) {
    const bondSlotInfo = slots[i];
    if (filterSlot.indexOf(bondSlotInfo.slot) == -1) {
      slotList.push(bondSlotInfo)
    }
  }
  return slotList;
}

['ethereum', 'bsc', 'arbitrum'].forEach(chain => {
  module.exports[chain] = { tvl }
})