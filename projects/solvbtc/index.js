const abi = require("./abi.json");
const { getConfig } = require("../helper/cache");
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, } = require("../helper/unwrapLPs");

// The Graph
const graphUrlList = {
  ethereum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-prod/version/latest',
  bsc: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-bsc/version/latest',
  arbitrum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-arbitrum/version/latest',
  mantle: 'http://api.0xgraph.xyz/subgraphs/name/solv-payable-factory-mentle-0xgraph',
  merlin: 'http://solv-subgraph-server-alb-694489734.us-west-1.elb.amazonaws.com:8000/subgraphs/name/solv-payable-factory-merlin',
}

const solvbtcListUrl = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/main/solvbtc.json';

async function tvl(api) {
  let solvbtc = (await getConfig('solv-protocol/solvbtc', solvbtcListUrl));

  await gm(api, solvbtc)
  await vaultBalance(api, solvbtc);
  await otherDeposit(api, solvbtc);

  return api.getBalances();
}

async function gm(api, solvbtc) {
  if (!solvbtc[api.chain] || !solvbtc[api.chain]["gm"]) {
    return;
  }
  let gm = solvbtc[api.chain]["gm"];

  let tokens = []
  for (const pool of gm["depositAddress"]) {
    for (const address of gm["gmTokens"]) {
      tokens.push({ address, pool })
    }
  }

  await sumTokens2({ api, tokensAndOwners: tokens.map(i => [i.address, i.pool]), permitFailure: true });
}

async function otherDeposit(api, solvbtc) {
  if (!solvbtc[api.chain] || !solvbtc[api.chain]["otherDeposit"]) {
    return;
  }
  let otherDeposit = solvbtc[api.chain]["otherDeposit"];

  let tokens = []
  for (const deposit of otherDeposit["depositAddress"]) {
    for (const tokenAddress of otherDeposit["tokens"]) {
      tokens.push({ tokenAddress, deposit })
    }
  }

  await sumTokens2({ api, tokensAndOwners: tokens.map(i => [i.tokenAddress, i.deposit]), permitFailure: true });
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

async function vaultBalance(api, solvbtc) {
  if (!solvbtc[api.chain] || !solvbtc[api.chain]["slot"]) {
    return;
  }
  let slot = solvbtc[api.chain]["slot"];

  const graphData = await getGraphData(api.timestamp, api.chain, api, slot);
  if (graphData.pools.length > 0) {
    const poolLists = graphData.pools;

    const poolConcretes = await concrete(poolLists, api);

    const poolBaseInfos = await api.multiCall({
      abi: abi.slotBaseInfo,
      calls: poolLists.map((index) => ({
        target: poolConcretes[index.contractAddress],
        params: [index.openFundShareSlot]
      })),
    })

    let vaults = {};
    for (const key in poolLists) {
      if (poolBaseInfos[key][1] && poolLists[key]["vault"]) {
        vaults[`${poolBaseInfos[key][1].toLowerCase()}-${poolLists[key]["vault"].toLowerCase()}`] = [poolBaseInfos[key][1], poolLists[key]["vault"]]
      }
    }

    const balances = await api.multiCall({
      abi: abi.balanceOf,
      calls: Object.values(vaults).map((index) => ({
        target: index[0],
        params: [index[1]]
      })),
    })

    for (const key in balances) {
      api.add(Object.values(vaults)[key][0], balances[key])
    }
  }
}


async function getGraphData(timestamp, chain, api, slot) {

  const slotDataQuery = `query PoolOrderInfos {
            poolOrderInfos(first: 1000  where:{fundraisingEndTime_gt:${timestamp}, openFundShareSlot_in: ${JSON.stringify(slot)}}) {
              marketContractAddress
              contractAddress
              navOracle
              poolId
              vault
              openFundShareSlot
          }
        }`;

  let data;
  if (graphUrlList[chain]) {
    data = (await cachedGraphQuery(`solv-protocol/funds-graph-data/${chain}`, graphUrlList[chain], slotDataQuery, { api, }));
  }

  let poolList = [];
  if (data != undefined && data.poolOrderInfos != undefined) {
    poolList = data.poolOrderInfos;
  }

  return {
    pools: poolList
  };
}

// node test.js projects/solvbtc
['ethereum', 'bsc', 'polygon', 'arbitrum', 'mantle', 'merlin'].forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})
