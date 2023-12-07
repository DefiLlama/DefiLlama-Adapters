const abi = require("./abi.json");
const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, } = require("../helper/unwrapLPs");

// The Graph
const graphUrlList = {
  ethereum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-prod/version/latest',
  bsc: 'https://api.thegraph.com/subgraphs/name/slov-payable/solv-v3-earn-factory',
  arbitrum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-arbitrum/version/latest',
  mantle: 'http://api.0xgraph.xyz/subgraphs/name/solv-payable-factory-mentle-0xgraph',
}

const slotListUrl = 'https://raw.githubusercontent.com/solv-finance-dev/solv-protocol-rwa-slot/main/slot.json';

const addressUrl = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/main/solv-funds.json';

const stakedAmountsAbi = 'function stakedAmounts(address) external view returns (uint256)';

async function borrowed(ts) {
  const { api } = arguments[3];
  const network = api.chain;

  let address = (await getConfig('solv-protocol/funds', addressUrl));
  let gm = address[api.chain]["gm"];

  const graphData = await getGraphData(ts, network, api);
  if (graphData.pools.length > 0) {
    const poolLists = graphData.pools;
    var pools = poolLists.filter((value) => {
      return gm == undefined || gm["depositAddress"].indexOf(value.vault) == -1;
    });
    const poolConcretes = await concrete(pools, api);
    const nav = await api.multiCall({
      abi: abi.getSubscribeNav,
      calls: pools.map((index) => ({
        target: index.navOracle,
        params: [index.poolId, ts]
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
  return api.getBalances()
}

async function tvl() {
  const { api } = arguments[3];

  let address = (await getConfig('solv-protocol/funds', addressUrl));
  let gm = address[api.chain]["gm"];

  let tokens = []
  for (const pool of gm["depositAddress"]) {
    for (const address of gm["gmTokens"]) {
      tokens.push({ address, pool })
    }
  }

  await sumTokens2({ api, tokensAndOwners: tokens.map(i => [i.address, i.pool]), permitFailure: true })
}


async function mantleTvl(ts, _, _1, { api }) {
  let address = (await getConfig('solv-protocol/funds', addressUrl));
  let klp = address[api.chain]["klp"];

  const stakedAmounts = await api.multiCall({
    abi: stakedAmountsAbi,
    calls: klp["klpPool"].map((pool) => ({
      target: klp["address"],
      params: [pool]
    })),
  })

  stakedAmounts.forEach(amount => {
    api.add(klp["address"], amount)
  })

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
            poolOrderInfos(first: 1000  where:{fundraisingEndTime_gt:${timestamp}, openFundShareSlot_not_in: ${JSON.stringify(rwaSlot)}}) {
              marketContractAddress
              contractAddress
              navOracle
              poolId
              vault
              openFundShareSlot
          }
        }`;
  const data = (await cachedGraphQuery(`solv-protocol/funds-graph-data/${chain}`, graphUrlList[chain], slotDataQuery, { api, }));

  let poolList = [];
  if (data != undefined && data.poolOrderInfos != undefined) {
    poolList = data.poolOrderInfos;
  }

  return {
    pools: poolList
  };
}
// node test.js projects/solv-protocol-funds
module.exports = {
  arbitrum: {
    tvl,
    borrowed: borrowed,
  },
  mantle: {
    tvl: mantleTvl,
    borrowed: borrowed,
  }
};